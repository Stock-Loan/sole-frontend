import type { ReactNode } from "react";

export interface AuthContextValue {
  user: { email: string } | null;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  clear: () => void;
  hasAnyRole: (roles: string[]) => boolean;
}

export interface AuthProviderProps {
  children: ReactNode;
}
