import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { routes } from "@/lib/routes";

interface PermissionGateProps {
	permission?: string | string[];
	children: ReactNode;
	fallback?: ReactNode;
	redirect?: boolean;
}

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
