import { Navigate } from "react-router-dom";
import { usePermissions } from "@/auth/hooks";
import { routes } from "@/shared/lib/routes";
import type { PermissionGateProps } from "./types";

export function PermissionGate({
	permission,
	mode = "all",
	children,
	fallback = null,
	redirect = false,
}: PermissionGateProps) {
	const { can } = usePermissions();

	const required = Array.isArray(permission)
		? permission
		: permission
			? [permission]
			: [];
	const allowed =
		required.length === 0
			? true
			: mode === "any"
				? required.some((perm) => can(perm))
				: can(required);

	if (!allowed) {
		if (redirect) {
			return <Navigate to={routes.notAuthorized} replace />;
		}
		return <>{fallback}</>;
	}

	return <>{children}</>;
}
