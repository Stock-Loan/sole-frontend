import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
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
import { isRefreshAuthFailure } from "@/shared/api/refresh";
import {
	getMeWithToken,
	logout as logoutApi,
	refreshSession,
	retryRequestWithStepUpToken,
	startImpersonation as startImpersonationApi,
	stopImpersonation as stopImpersonationApi,
	verifyStepUpMfa,
} from "@/auth/api";
import {
	AuthContext,
	ImpersonationContext,
	StepUpMfaContext,
} from "@/auth/context";
import type {
	AuthContextValue,
	AuthUser,
	ImpersonationContextValue,
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
import { queryClient } from "@/shared/api/queryClient";
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
			const scopedUser: AuthUser = { ...nextUser, org_id: orgId };
			setTokens(nextTokens);
			setUser(scopedUser);
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
		// Clear any persisted impersonation state so stale data doesn't
		// interfere with the next login session.
		persistImpersonation(null);
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
		// Prefer in-memory authenticated org to avoid stale localStorage org headers.
		setOrgResolver(() => user?.org_id ?? loadPersistedOrgId() ?? null);

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
			} catch (error) {
				if (isRefreshAuthFailure(error)) {
					clearSession();
				}
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

// ─── Impersonation Provider ───────────────────────────────────────────────────

const IMPERSONATION_STORAGE_KEY = "sole.impersonation";

interface PersistedImpersonation {
	impersonatorUserId: string;
	originalUserEmail: string;
	originalUserFullName: string | null;
}

function loadPersistedImpersonation(): PersistedImpersonation | null {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(IMPERSONATION_STORAGE_KEY);
		if (!raw) return null;
		return JSON.parse(raw) as PersistedImpersonation;
	} catch {
		return null;
	}
}

function persistImpersonation(data: PersistedImpersonation | null) {
	if (typeof localStorage === "undefined") return;
	if (!data) {
		localStorage.removeItem(IMPERSONATION_STORAGE_KEY);
		return;
	}
	try {
		localStorage.setItem(IMPERSONATION_STORAGE_KEY, JSON.stringify(data));
	} catch {
		// ignore storage errors
	}
}

export function ImpersonationProvider({ children }: PropsWithChildren) {
	const [isLoading, setIsLoading] = useState(false);
	const [impersonatorUserId, setImpersonatorUserId] = useState<string | null>(
		() => loadPersistedImpersonation()?.impersonatorUserId ?? null,
	);
	const [originalAdminInfo, setOriginalAdminInfo] = useState<{
		email: string;
		fullName: string | null;
	} | null>(() => {
		const persisted = loadPersistedImpersonation();
		if (persisted) {
			return {
				email: persisted.originalUserEmail,
				fullName: persisted.originalUserFullName,
			};
		}
		return null;
	});

	// We need to get the auth context from parent - use a ref to avoid re-renders
	const authRef = useRef<AuthContextValue | null>(null);

	const startImpersonation = useCallback(async (membershipId: string) => {
		const auth = authRef.current;
		if (!auth?.user || !auth?.tokens) {
			throw new Error("Not authenticated");
		}

		setIsLoading(true);
		try {
			const result = await startImpersonationApi({
				target_membership_id: membershipId,
			});

			// Persist impersonation metadata for page reloads.
			// SECURITY: Do NOT store admin tokens — they would be
			// accessible to XSS in the impersonated context.
			persistImpersonation({
				impersonatorUserId: result.impersonator_user_id,
				originalUserEmail: auth.user.email,
				originalUserFullName: auth.user.full_name ?? null,
			});

			// Persist the CSRF token from the impersonation response so the
			// bootstrap refresh after page reload can pass CSRF validation.
			if (result.csrf_token) {
				setCsrfToken(result.csrf_token);
			}

			// Full page reload — the bootstrap will refresh from the
			// impersonation cookie and set up the session correctly.
			// Do NOT call auth.setSession() or queryClient.resetQueries()
			// before navigating: both trigger API calls with the stale
			// admin access token, risking a 401 → refresh rotation that
			// can revoke the impersonation session.
			window.location.assign("/app/workspace");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const stopImpersonation = useCallback(async () => {
		const auth = authRef.current;
		if (!auth) {
			throw new Error("Not authenticated");
		}

		setIsLoading(true);
		try {
			const result = await stopImpersonationApi();

			// Clear persisted impersonation state before navigating
			persistImpersonation(null);

			// Persist the CSRF token from the stop response
			if (result.csrf_token) {
				setCsrfToken(result.csrf_token);
			}

			// Full page reload — bootstrap will refresh from the admin's
			// cookie and restore the admin session.
			window.location.assign("/app/workspace");
		} finally {
			setIsLoading(false);
		}
	}, []);

	const isImpersonating = impersonatorUserId !== null;

	const value = useMemo<ImpersonationContextValue>(
		() => ({
			isImpersonating,
			impersonatorUserId,
			originalAdminInfo,
			startImpersonation,
			stopImpersonation,
			isLoading,
		}),
		[
			isImpersonating,
			impersonatorUserId,
			originalAdminInfo,
			startImpersonation,
			stopImpersonation,
			isLoading,
		],
	);

	return (
		<ImpersonationContext.Provider value={value}>
			<ImpersonationAuthSync authRef={authRef} />
			{children}
		</ImpersonationContext.Provider>
	);
}

/**
 * Internal component that syncs the AuthContext ref into ImpersonationProvider.
 * This avoids circular dependency between the two providers.
 */
function ImpersonationAuthSync({
	authRef,
}: {
	authRef: React.MutableRefObject<AuthContextValue | null>;
}) {
	// Sync the AuthContext ref — this component is rendered inside AuthProvider
	const ctx = useAuthContextSafe();
	authRef.current = ctx;
	return null;
}

function useAuthContextSafe(): AuthContextValue | null {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const ctx = useContext(AuthContext);
	return ctx ?? null;
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
