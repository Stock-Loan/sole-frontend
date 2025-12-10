import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContextValue, AuthProviderProps } from "../types";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const TOKEN_KEY = "sole:accessToken";

function loadToken() {
  if (typeof localStorage === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function persistToken(token: string | null) {
  if (typeof localStorage === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export const authStore = {
  getToken: () => loadToken(),
  clear: () => persistToken(null),
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setTokenState] = useState<string | null>(() => loadToken());
  const navigate = useNavigate();

  useEffect(() => {
    persistToken(token);
  }, [token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: token ? { email: "placeholder@user" } : null,
      isAuthenticated: Boolean(token),
      setToken: (t: string) => setTokenState(t),
      clear: () => {
        setTokenState(null);
        navigate("/login", { replace: true });
      },
      hasAnyRole: () => true,
    }),
    [token, navigate]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
