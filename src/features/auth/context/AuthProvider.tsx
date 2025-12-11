import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import {
	setAccessTokenResolver,
	setUnauthorizedHandler,
} from "@/lib/apiClient";
import { logout as logoutApi } from "../api/auth.api";
import type { AuthUser, RoleCode, TokenPair } from "../types";
import { AuthContext } from "./auth-context";
import type { AuthContextValue } from "./auth-context";

export function AuthProvider({ children }: PropsWithChildren) {
	const [user, setUser] = useState<AuthUser | null>(null);
	const [tokens, setTokens] = useState<TokenPair | null>(null);
	const [isAuthenticating, setIsAuthenticating] = useState(false);

	const setSession = useCallback(
		(nextTokens: TokenPair, nextUser: AuthUser) => {
			setTokens(nextTokens);
			setUser(nextUser);
			setIsAuthenticating(false);
		},
		[]
	);

	const clearSession = useCallback(() => {
		setUser(null);
		setTokens(null);
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
		setUnauthorizedHandler(clearSession);

		return () => setUnauthorizedHandler(null);
	}, [tokens?.access_token, clearSession]);

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
