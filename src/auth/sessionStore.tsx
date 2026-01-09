import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
	setAccessTokenResolver,
	setRefreshTokenResolver,
	setTokenUpdater,
	setUnauthorizedHandler,
} from "@/shared/api/http";
import { logout as logoutApi } from "@/auth/api";
import type { AuthUser, PersistedSession, RoleCode, TokenPair } from "@/auth/types";
import { routes } from "@/shared/lib/routes";
import { AuthContext } from "./context";
import type { AuthContextValue } from "./context";

const STORAGE_KEY = "sole.auth.session";

function loadPersistedSession(): PersistedSession {
	if (typeof localStorage === "undefined") {
		return { user: null, tokens: null };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return { user: null, tokens: null };
		}
		const parsed = JSON.parse(raw) as PersistedSession;
		return {
			user: parsed?.user ?? null,
			tokens: parsed?.tokens ?? null,
		};
	} catch (error) {
		console.warn("Failed to load session from storage", error);
		return { user: null, tokens: null };
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
	const [isAuthenticating, setIsAuthenticating] = useState(false);

	const setSession = useCallback((nextTokens: TokenPair, nextUser: AuthUser) => {
		setTokens(nextTokens);
		setUser(nextUser);
		persistSession({ tokens: nextTokens, user: nextUser });
		setIsAuthenticating(false);
	}, []);

	const clearSession = useCallback(() => {
		setUser(null);
		setTokens(null);
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
	}, [tokens?.access_token, tokens?.refresh_token, clearSession]);

	useEffect(() => {
		if (user && tokens) {
			persistSession({ user, tokens });
		}
	}, [user, tokens]);

	const hasAnyRole = useCallback(
		(roles?: RoleCode[]) => {
			if (!roles || roles.length === 0) {
				return true;
			}

			return roles.some((role) => user?.roles?.includes(role));
		},
		[user?.roles]
	);

	const value = useMemo<AuthContextValue>(
		() => ({
			user,
			tokens,
			isAuthenticating,
			setSession,
			setUser,
			clearSession,
			logout,
			hasAnyRole,
		}),
		[
			user,
			tokens,
			isAuthenticating,
			setSession,
			setUser,
			clearSession,
			logout,
			hasAnyRole,
		]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
