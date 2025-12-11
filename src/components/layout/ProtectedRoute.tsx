import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { routes } from "@/lib/routes";
import type { ProtectedRouteProps } from "./types";

export function ProtectedRoute({ roles, children }: ProtectedRouteProps) {
	const location = useLocation();
	const { user, hasAnyRole } = useAuth();

	if (!user) {
		return <Navigate to={routes.login} state={{ from: location }} replace />;
	}

	if (roles && !hasAnyRole(roles)) {
		return <Navigate to={routes.notAuthorized} replace />;
	}

	return children ? <>{children}</> : <Outlet />;
}
