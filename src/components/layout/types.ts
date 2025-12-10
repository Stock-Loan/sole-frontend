import type { ReactNode } from "react";

export interface ShellProps {
  children: ReactNode;
}

export interface ProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
}
