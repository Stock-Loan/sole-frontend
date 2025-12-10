import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { ProtectedRouteProps } from "./types";

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
  const { user, isAuthenticated, hasAnyRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !hasAnyRole(roles)) {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}
