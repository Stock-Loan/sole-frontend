import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PropsWithChildren } from "react";
import {
	setAccessTokenResolver,
	setOrgResolver,
	setStepUpHandler,
	setTokenUpdater,
	setUnauthorizedHandler,
} from "@/shared/api/http";
import { setCsrfToken } from "@/shared/api/csrf";
import { getJwtExpiry } from "@/shared/api/jwt";
import {
	getMeWithToken,
	logout as logoutApi,
	refreshSession,
	retryRequestWithStepUpToken,
	verifyStepUpMfa,
} from "@/auth/api";
import { AuthContext, StepUpMfaContext } from "@/auth/context";
import type {
	AuthContextValue,
	AuthUser,
	RoleCode,
	StepUpChallengeResponse,
	StepUpMfaContextValue,
	StepUpMfaProviderProps,
	TokenPair,
} from "@/auth/types";
import type {
	PendingStepUpRequest,
	StepUpChallengeData,
} from "@/shared/api/types";
import { routes } from "@/shared/lib/routes";

// ─── Auth Provider ───────────────────────────────────────────────────────────

const TENANCY_STORAGE_KEY = "sole.tenancy";

function loadPersistedOrgId(): string | null {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(TENANCY_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { currentOrgId?: string | null };
		return parsed?.currentOrgId ?? null;
	} catch {
		return null;
	}
}

function persistCurrentOrgId(orgId?: string | null) {
	if (!orgId || typeof localStorage === "undefined") return;
	try {
		const raw = localStorage.getItem(TENANCY_STORAGE_KEY);
		const parsed = raw ? (JSON.parse(raw) as { orgs?: unknown }) : {};
		const orgs = Array.isArray(parsed?.orgs) ? parsed.orgs : [];
		localStorage.setItem(
			TENANCY_STORAGE_KEY,
			JSON.stringify({ orgs, currentOrgId: orgId }),
		);
	} catch {
		// ignore storage errors
	}
}

export function AuthProvider({ children }: PropsWithChildren) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [tokens, setTokens] = useState<TokenPair | null>(null);
	const [tokensByOrgId, setTokensByOrgId] = useState<Record<string, TokenPair>>(
		{},
	);
	const [isAuthenticating, setIsAuthenticating] = useState(true);
	const refreshTimerRef = useRef<number | null>(null);

	const setSession = useCallback(
		(nextTokens: TokenPair, nextUser: AuthUser) => {
			setTokens(nextTokens);
			setUser(nextUser);
			if (nextUser?.org_id) {
				persistCurrentOrgId(nextUser.org_id);
			}
			setTokensByOrgId((prev) => {
				if (!nextUser?.org_id) return prev;
				const next = { ...prev, [nextUser.org_id]: nextTokens };
				return next;
			});
			if (nextTokens.csrf_token !== undefined) {
				setCsrfToken(nextTokens.csrf_token ?? null);
			}
			setIsAuthenticating(false);
		},
		[],
	);

	const setSessionForOrg = useCallback(
		(orgId: string, nextTokens: TokenPair, nextUser: AuthUser) => {
			setTokens(nextTokens);
			setUser(nextUser);
			persistCurrentOrgId(orgId);
			setTokensByOrgId((prev) => {
				const next = { ...prev, [orgId]: nextTokens };
				return next;
			});
			if (nextTokens.csrf_token !== undefined) {
				setCsrfToken(nextTokens.csrf_token ?? null);
			}
			setIsAuthenticating(false);
		},
		[],
	);

	const clearSession = useCallback(() => {
		setUser(null);
		setTokens(null);
		setTokensByOrgId({});
		setCsrfToken(null);
		setIsAuthenticating(false);
	}, []);

	const logout = useCallback(async () => {
		try {
			await logoutApi();
		} catch (error) {
			console.warn("Logout failed", error);
		} finally {
			clearSession();
		}
	}, [clearSession]);

	useEffect(() => {
		setAccessTokenResolver(() => tokens?.access_token ?? null);
		setOrgResolver(() => loadPersistedOrgId() ?? user?.org_id ?? null);

		setTokenUpdater((newTokens) => {
			setTokens((prev) => {
				const next = { ...prev, ...newTokens } as TokenPair;
				return next;
			});
			setTokensByOrgId((prev) => {
				const orgId = user?.org_id;
				if (!orgId) return prev;
				const next = {
					...prev,
					[orgId]: { ...(prev[orgId] ?? {}), ...newTokens },
				} as Record<string, TokenPair>;
				return next;
			});
			if ("csrf_token" in newTokens) {
				setCsrfToken(newTokens.csrf_token ?? null);
			}
		});

		setUnauthorizedHandler(() => {
			clearSession();
			window.location.assign(routes.login);
		});

		return () => {
			setAccessTokenResolver(() => null);
			setTokenUpdater(() => {});
			setUnauthorizedHandler(null);
		};
	}, [tokens?.access_token, clearSession, user]);

	useEffect(() => {
		let isMounted = true;

		const bootstrap = async () => {
			setIsAuthenticating(true);
			try {
				const orgId = loadPersistedOrgId();
				const refreshed = await refreshSession(orgId ?? undefined);
				if (!isMounted) return;
				if (!refreshed?.access_token) {
					clearSession();
					return;
				}
				const nextTokens: TokenPair = {
					access_token: refreshed.access_token,
					token_type: "bearer",
				};
				if (refreshed.csrf_token !== undefined) {
					nextTokens.csrf_token = refreshed.csrf_token;
					setCsrfToken(refreshed.csrf_token ?? null);
				}
				const nextUser = await getMeWithToken(
					nextTokens.access_token,
					orgId ?? undefined,
				);
				if (!isMounted) return;
				setSession(nextTokens, nextUser);
			} catch {
				if (isMounted) {
					clearSession();
				}
			} finally {
				if (isMounted) {
					setIsAuthenticating(false);
				}
			}
		};

		void bootstrap();
		return () => {
			isMounted = false;
		};
	}, [clearSession, setSession]);

	useEffect(() => {
		if (refreshTimerRef.current) {
			window.clearTimeout(refreshTimerRef.current);
			refreshTimerRef.current = null;
		}
		if (!tokens?.access_token || !user) return;

		const exp = getJwtExpiry(tokens.access_token);
		if (!exp) return;
		const baseRefreshAt = exp * 1000 - 60_000;
		const jitter = Math.floor(Math.random() * 30_000);
		const jitterDirection = Math.random() < 0.5 ? -1 : 1;
		const jitteredRefreshAt = baseRefreshAt + jitterDirection * jitter;
		const latestRefreshAt = exp * 1000 - 5_000;
		const refreshAtMs = Math.min(jitteredRefreshAt, latestRefreshAt);
		const delay = Math.max(0, refreshAtMs - Date.now());

		refreshTimerRef.current = window.setTimeout(async () => {
			try {
				const orgId = user.org_id ?? loadPersistedOrgId() ?? undefined;
				const refreshed = await refreshSession(orgId);
				if (!refreshed?.access_token) {
					clearSession();
					return;
				}
				const nextTokens: TokenPair = {
					access_token: refreshed.access_token,
					token_type: "bearer",
				};
				if (refreshed.csrf_token !== undefined) {
					nextTokens.csrf_token = refreshed.csrf_token;
				}
				setSession(nextTokens, user);
			} catch {
				clearSession();
			}
		}, delay);

		return () => {
			if (refreshTimerRef.current) {
				window.clearTimeout(refreshTimerRef.current);
				refreshTimerRef.current = null;
			}
		};
	}, [tokens?.access_token, user, clearSession, setSession]);

	const hasAnyRole = useCallback(
		(roles?: RoleCode[]) => {
			if (!roles || roles.length === 0) {
				return true;
			}
			return roles.some((role) => user?.roles?.includes(role));
		},
		[user?.roles],
	);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			tokens,
			isAuthenticating,
			setSession,
			setSessionForOrg,
			setUser,
			clearSession,
			logout,
			hasAnyRole,
			getTokensForOrg: (orgId?: string | null) =>
				orgId ? (tokensByOrgId[orgId] ?? null) : null,
		}),
		[
			user,
			tokens,
			isAuthenticating,
			setSession,
			setSessionForOrg,
			setUser,
			clearSession,
			logout,
			hasAnyRole,
			tokensByOrgId,
		],
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Step-Up MFA Provider ────────────────────────────────────────────────────

export function StepUpMfaProvider({ children }: StepUpMfaProviderProps) {
	const [challenge, setChallenge] = useState<StepUpChallengeResponse | null>(
		null,
	);
	const [pendingRequest, setPendingRequest] =
		useState<PendingStepUpRequest | null>(null);
	const [isVerifying, setIsVerifying] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const requestStepUpRef = useRef<
		| ((challenge: StepUpChallengeData, request: PendingStepUpRequest) => void)
		| null
	>(null);

	const requestStepUp = useCallback(
		(challengeData: StepUpChallengeData, request: PendingStepUpRequest) => {
			setChallenge(challengeData);
			setPendingRequest(request);
			setError(null);
		},
		[],
	);

	requestStepUpRef.current = requestStepUp;

	useEffect(() => {
		setStepUpHandler((challenge, request) => {
			requestStepUpRef.current?.(challenge, request);
		});
		return () => {
			setStepUpHandler(null);
		};
	}, []);

	const verifyStepUp = useCallback(
		async (code: string, codeType: "totp" | "recovery" = "totp") => {
			if (!challenge || !pendingRequest) {
				throw new Error("No pending step-up challenge");
			}
			setIsVerifying(true);
			setError(null);
			try {
				const result = await verifyStepUpMfa({
					challenge_token: challenge.challenge_token,
					code,
					code_type: codeType,
				});
				const response = await retryRequestWithStepUpToken(
					pendingRequest.config as Record<string, unknown>,
					result.step_up_token,
				);
				pendingRequest.resolve({ data: response });
				setChallenge(null);
				setPendingRequest(null);
			} catch (err) {
				const message =
					err instanceof Error ? err.message : "Verification failed";
				setError(message);
				throw err;
			} finally {
				setIsVerifying(false);
			}
		},
		[challenge, pendingRequest],
	);

	const cancelStepUp = useCallback(() => {
		if (pendingRequest) {
			pendingRequest.reject(new Error("Step-up MFA cancelled by user"));
		}
		setChallenge(null);
		setPendingRequest(null);
		setError(null);
	}, [pendingRequest]);

	const value = useMemo<StepUpMfaContextValue>(
		() => ({
			isStepUpRequired: challenge !== null,
			challenge,
			pendingRequest,
			requestStepUp,
			verifyStepUp,
			cancelStepUp,
			isVerifying,
			error,
		}),
		[
			challenge,
			pendingRequest,
			requestStepUp,
			verifyStepUp,
			cancelStepUp,
			isVerifying,
			error,
		],
	);

	return (
		<StepUpMfaContext.Provider value={value}>
			{children}
		</StepUpMfaContext.Provider>
	);
}
