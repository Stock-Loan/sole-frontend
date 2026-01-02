import { Navigate } from "react-router-dom";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { routes } from "@/lib/routes";
import type { PermissionGateProps } from "./types";

export function PermissionGate({
	permission,
	children,
	fallback = null,
	redirect = false,
}: PermissionGateProps) {
	const { can } = usePermissions();

	if (permission && !can(permission)) {
		if (redirect) {
			return <Navigate to={routes.notAuthorized} replace />;
		}
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
