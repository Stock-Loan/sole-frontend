import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
	setAccessTokenResolver,
	setRefreshTokenResolver,
	setTokenUpdater,
	setUnauthorizedHandler,
} from "@/shared/api/http";
import { logout as logoutApi } from "@/auth/api";
import type {
	AuthUser,
	PersistedSession,
	RoleCode,
	TokenPair,
} from "@/auth/types";
import { routes } from "@/shared/lib/routes";
import { AuthContext } from "./context";
import type { AuthContextValue } from "./types";

const STORAGE_KEY = "sole.auth.session";

function loadPersistedSession(): PersistedSession {
	if (typeof localStorage === "undefined") {
		return { user: null, tokens: null, tokensByOrgId: {} };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return { user: null, tokens: null, tokensByOrgId: {} };
		}
		const parsed = JSON.parse(raw) as PersistedSession;
		return {
			user: parsed?.user ?? null,
			tokens: parsed?.tokens ?? null,
			tokensByOrgId: parsed?.tokensByOrgId ?? {},
		};
	} catch (error) {
		console.warn("Failed to load session from storage", error);
		return { user: null, tokens: null, tokensByOrgId: {} };
	}
}

function persistSession(session: PersistedSession) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
	} catch (error) {
		console.warn("Failed to persist session", error);
	}
}

function clearPersistedSession() {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.warn("Failed to clear session", error);
	}
}

export function AuthProvider({ children }: PropsWithChildren) {
	const persisted = loadPersistedSession();

	const [user, setUser] = useState<AuthUser | null>(persisted.user);
	const [tokens, setTokens] = useState<TokenPair | null>(persisted.tokens);
	const [tokensByOrgId, setTokensByOrgId] = useState<Record<string, TokenPair>>(
		persisted.tokensByOrgId ?? {},
	);
	const [isAuthenticating, setIsAuthenticating] = useState(false);

	const setSession = useCallback(
		(nextTokens: TokenPair, nextUser: AuthUser) => {
			setTokens(nextTokens);
			setUser(nextUser);
			setTokensByOrgId((prev) => {
				if (!nextUser?.org_id) return prev;
				const next = { ...prev, [nextUser.org_id]: nextTokens };
				persistSession({
					tokens: nextTokens,
					user: nextUser,
					tokensByOrgId: next,
				});
				return next;
			});
			setIsAuthenticating(false);
		},
		[],
	);

	const setSessionForOrg = useCallback(
		(orgId: string, nextTokens: TokenPair, nextUser: AuthUser) => {
			setTokens(nextTokens);
			setUser(nextUser);
			setTokensByOrgId((prev) => {
				const next = { ...prev, [orgId]: nextTokens };
				persistSession({
					tokens: nextTokens,
					user: nextUser,
					tokensByOrgId: next,
				});
				return next;
			});
			setIsAuthenticating(false);
		},
		[],
	);

	const clearSession = useCallback(() => {
		setUser(null);
		setTokens(null);
		setTokensByOrgId({});
		clearPersistedSession();
		setIsAuthenticating(false);
	}, []);

	const logout = useCallback(async () => {
		try {
			await logoutApi();
		} catch (error) {
			// ignore logout errors
			console.warn("Logout failed", error);
		} finally {
			clearSession();
		}
	}, [clearSession]);

	useEffect(() => {
		setAccessTokenResolver(() => tokens?.access_token ?? null);
		setRefreshTokenResolver(() => tokens?.refresh_token ?? null);

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
				persistSession({ tokens, user, tokensByOrgId: next });
				return next;
			});
		});

		setUnauthorizedHandler(() => {
			clearSession();
			window.location.assign(routes.login);
		});

		return () => {
			setAccessTokenResolver(() => null);
			setRefreshTokenResolver(() => null);
			setTokenUpdater(() => {});
			setUnauthorizedHandler(null);
		};
	}, [tokens?.access_token, tokens?.refresh_token, clearSession, tokens, user]);

	useEffect(() => {
		if (user && tokens) {
			persistSession({ user, tokens, tokensByOrgId });
		}
	}, [user, tokens, tokensByOrgId]);

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
