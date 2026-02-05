import axios, { isAxiosError } from "axios";
import { unwrapApiResponse } from "@/shared/api/response";
import { getCsrfToken, setCsrfToken } from "@/shared/api/csrf";
import type { TokenPair } from "@/auth/types";
import type { CsrfTokenResponse } from "./types";

const baseURL = import.meta.env.VITE_API_BASE_URL;

const inflightRefresh: Record<string, Promise<TokenPair> | undefined> = {};

function getRefreshKey(orgId?: string | null) {
	return orgId ? `org:${orgId}` : "org:default";
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

async function refreshOnce(orgId?: string): Promise<TokenPair> {
	const csrfToken = getCsrfToken();
	const headers: Record<string, string> = {};
	if (csrfToken) {
		headers["X-CSRF-Token"] = csrfToken;
	}
	if (orgId) {
		headers["X-Org-Id"] = orgId;
	}
	const { data } = await axios.post<TokenPair>(
		`${baseURL}/auth/refresh`,
		undefined,
		{ headers, withCredentials: true },
	);
	const payload = unwrapApiResponse<TokenPair>(data);
	if (payload?.csrf_token !== undefined) {
		setCsrfToken(payload.csrf_token ?? null);
	}
	return payload;
}

export async function refreshSessionWithRetry(
	orgId?: string,
): Promise<TokenPair> {
	const key = getRefreshKey(orgId);
	if (inflightRefresh[key]) {
		return inflightRefresh[key];
	}

	const promise = (async () => {
		try {
			return await refreshOnce(orgId);
		} catch (error) {
			if (isCsrfFailure(error)) {
				await requestCsrfToken(orgId);
				return await refreshOnce(orgId);
			}
			throw error;
		}
	})().finally(() => {
		delete inflightRefresh[key];
	});

	inflightRefresh[key] = promise;
	return promise;
}
