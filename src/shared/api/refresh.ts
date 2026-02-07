import axios, { isAxiosError } from "axios";
import { unwrapApiResponse } from "@/shared/api/response";
import { getCsrfToken, setCsrfToken } from "@/shared/api/csrf";
import type { CsrfTokenResponse } from "./types";

const baseURL = import.meta.env.VITE_API_BASE_URL;

type RefreshTokenPair = {
	access_token?: string;
	refresh_token?: string;
	token_type?: string;
	csrf_token?: string | null;
};

const inflightRefresh: Record<string, Promise<RefreshTokenPair> | undefined> =
	{};

const REFRESH_LOCK_TTL_MS = 15_000;
const REFRESH_CHANNEL_NAME = "sole.auth.refresh";
const REFRESH_LOCK_PREFIX = "sole.auth.refresh.lock";
const TAB_ID_KEY = "sole.auth.tab_id";

const refreshChannel =
	typeof BroadcastChannel !== "undefined"
		? new BroadcastChannel(REFRESH_CHANNEL_NAME)
		: null;

function getRefreshKey(orgId?: string | null) {
	return orgId ? `org:${orgId}` : "org:default";
}

function getLockKey(orgId?: string | null) {
	return `${REFRESH_LOCK_PREFIX}:${orgId ?? "default"}`;
}

function getTabId(): string {
	if (typeof sessionStorage === "undefined") {
		return "tab-" + Math.random().toString(36).slice(2);
	}
	try {
		const existing = sessionStorage.getItem(TAB_ID_KEY);
		if (existing) return existing;
		const next = "tab-" + Math.random().toString(36).slice(2);
		sessionStorage.setItem(TAB_ID_KEY, next);
		return next;
	} catch {
		return "tab-" + Math.random().toString(36).slice(2);
	}
}

const tabId = getTabId();

type RefreshLock = { ownerId: string; expiresAt: number };

function readLock(lockKey: string): RefreshLock | null {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(lockKey);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as RefreshLock;
		if (!parsed?.ownerId || !parsed?.expiresAt) return null;
		return parsed;
	} catch {
		return null;
	}
}

function writeLock(lockKey: string, lock: RefreshLock) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(lockKey, JSON.stringify(lock));
	} catch {
		// ignore storage errors
	}
}

function clearLock(lockKey: string) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.removeItem(lockKey);
	} catch {
		// ignore storage errors
	}
}

function tryAcquireLock(orgId?: string | null) {
	if (typeof localStorage === "undefined") return null;
	const lockKey = getLockKey(orgId);
	const now = Date.now();
	const existing = readLock(lockKey);
	if (existing && existing.expiresAt > now && existing.ownerId !== tabId) {
		return null;
	}
	const lock: RefreshLock = { ownerId: tabId, expiresAt: now + REFRESH_LOCK_TTL_MS };
	writeLock(lockKey, lock);
	const confirm = readLock(lockKey);
	if (!confirm || confirm.ownerId !== tabId) return null;
	return {
		release: () => {
			const current = readLock(lockKey);
			if (current?.ownerId === tabId) {
				clearLock(lockKey);
			}
		},
	};
}

function broadcastRefresh(
	orgId: string | null | undefined,
	tokens: RefreshTokenPair,
) {
	if (!refreshChannel) return;
	refreshChannel.postMessage({
		type: "refresh:complete",
		key: getRefreshKey(orgId),
		tokens,
	});
}

function waitForBroadcast(
	orgId?: string | null,
): Promise<RefreshTokenPair | null> {
	if (!refreshChannel) return Promise.resolve(null);
	const key = getRefreshKey(orgId);
	return new Promise((resolve) => {
		const handler = (event: MessageEvent) => {
			const payload = event.data as
				| { type?: string; key?: string; tokens?: RefreshTokenPair }
				| undefined;
			if (!payload || payload.type !== "refresh:complete") return;
			if (payload.key !== key) return;
			cleanup();
			resolve(payload.tokens ?? null);
		};
		const cleanup = () => {
			refreshChannel.removeEventListener("message", handler);
			clearTimeout(timeoutId);
		};
		const timeoutId = setTimeout(() => {
			cleanup();
			resolve(null);
		}, REFRESH_LOCK_TTL_MS);
		refreshChannel.addEventListener("message", handler);
	});
}

function isOverloadFailure(error: unknown): boolean {
	if (!isAxiosError(error)) return false;
	const status = error.response?.status;
	return status === 429 || status === 503;
}

function isRetryableFailure(error: unknown): boolean {
	if (!isAxiosError(error)) return true;
	const status = error.response?.status;
	if (!status) return true;
	if (status === 429 || status === 503 || status === 408) return true;
	return status >= 500;
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractErrorMessage(error: unknown): string | null {
	if (!isAxiosError(error)) return null;
	const data = error.response?.data as
		| { message?: string; detail?: string; details?: { detail?: string } }
		| undefined;
	if (!data) return null;
	return data.message || data.detail || data.details?.detail || null;
}

function isCsrfFailure(error: unknown): boolean {
	if (!isAxiosError(error)) return false;
	if (error.response?.status !== 403) return false;
	const message = extractErrorMessage(error) || "";
	return message.toLowerCase().includes("csrf");
}

function isOrgScopedFailure(error: unknown): boolean {
	if (!isAxiosError(error)) return false;
	const status = error.response?.status;
	if (!status || ![400, 401, 403, 404].includes(status)) return false;
	const message = (extractErrorMessage(error) || "").toLowerCase();
	if (!message) return status === 404;
	return (
		message.includes("tenant") ||
		message.includes("org") ||
		message.includes("organization") ||
		message.includes("member")
	);
}

export function isRefreshAuthFailure(error: unknown): boolean {
	if (!isAxiosError(error)) return false;
	const status = error.response?.status;
	if (!status) return false;
	// Retriable infrastructure failures should never force logout.
	if (isRetryableFailure(error)) return false;
	// CSRF/tenant/missing token/invalid token failures should force re-auth.
	if (status === 401 || status === 403 || status === 400 || status === 404) {
		return true;
	}
	return false;
}

async function requestCsrfToken(
	orgId?: string,
): Promise<CsrfTokenResponse | null> {
	const headers: Record<string, string> = {};
	if (orgId) {
		headers["X-Org-Id"] = orgId;
	}
	const { data } = await axios.post<CsrfTokenResponse>(
		`${baseURL}/auth/refresh/csrf`,
		undefined,
		{ headers, withCredentials: true },
	);
	const payload = unwrapApiResponse<CsrfTokenResponse>(data);
	if (payload?.csrf_token !== undefined) {
		setCsrfToken(payload.csrf_token ?? null);
	}
	return payload;
}

async function refreshOnce(orgId?: string): Promise<RefreshTokenPair> {
	const csrfToken = getCsrfToken();
	const headers: Record<string, string> = {};
	if (csrfToken) {
		headers["X-CSRF-Token"] = csrfToken;
	}
	if (orgId) {
		headers["X-Org-Id"] = orgId;
	}
	const { data } = await axios.post<RefreshTokenPair>(
		`${baseURL}/auth/refresh`,
		undefined,
		{ headers, withCredentials: true },
	);
	const payload = unwrapApiResponse<RefreshTokenPair>(data);
	if (payload?.csrf_token !== undefined) {
		setCsrfToken(payload.csrf_token ?? null);
	}
	return payload;
}

export async function refreshSessionWithRetry(
	orgId?: string,
): Promise<RefreshTokenPair> {
	const key = getRefreshKey(orgId);
	if (inflightRefresh[key]) {
		return inflightRefresh[key];
	}

	const promise = (async () => {
		let lock = tryAcquireLock(orgId);
		if (!lock) {
			const broadcasted = await waitForBroadcast(orgId);
			if (broadcasted?.access_token) {
				return broadcasted;
			}
			lock = tryAcquireLock(orgId);
		}

		const runRefresh = async () => {
			let csrfRetried = false;
			let retryCount = 0;
			let attemptedOrgFallback = false;
			let targetOrgId = orgId;
			while (true) {
				try {
					return await refreshOnce(targetOrgId);
				} catch (error) {
					if (isCsrfFailure(error) && !csrfRetried) {
						csrfRetried = true;
						await requestCsrfToken(targetOrgId);
						continue;
					}
					if (
						targetOrgId &&
						!attemptedOrgFallback &&
						isOrgScopedFailure(error)
					) {
						attemptedOrgFallback = true;
						targetOrgId = undefined;
						csrfRetried = false;
						retryCount = 0;
						continue;
					}
					if (isRetryableFailure(error) && retryCount < 2) {
						retryCount += 1;
						const base = isOverloadFailure(error) ? 300 : 500;
						const jitter = base + Math.floor(Math.random() * 900);
						await sleep(jitter);
						continue;
					}
					throw error;
				}
			}
		};

		try {
			const tokens = await runRefresh();
			broadcastRefresh(orgId, tokens);
			return tokens;
		} finally {
			lock?.release();
		}
	})().finally(() => {
		delete inflightRefresh[key];
	});

	inflightRefresh[key] = promise;
	return promise;
}
