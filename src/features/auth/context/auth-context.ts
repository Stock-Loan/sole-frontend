import { createContext, useContext } from "react";
import type { AuthUser, RoleCode, TokenPair } from "../types";

export interface AuthContextValue {
	user: AuthUser | null;
	tokens: TokenPair | null;
	isAuthenticating: boolean;
	setSession: (tokens: TokenPair, user: AuthUser) => void;
	setUser: (user: AuthUser | null) => void;
	clearSession: () => void;
	logout: () => Promise<void>;
	hasAnyRole: (roles?: RoleCode[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
	undefined
);

export function useAuthContext() {
	const ctx = useContext(AuthContext);
	if (!ctx) {
		throw new Error("useAuthContext must be used within an AuthProvider");
	}
	return ctx;
}
