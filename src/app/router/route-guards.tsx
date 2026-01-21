import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { LoadingState } from "@/shared/ui/LoadingState";
import { useTenant } from "@/features/tenancy/hooks";
import { routes } from "@/shared/lib/routes";
import { useAuth, usePermissions } from "@/auth/hooks";
import type { RequirePermissionProps } from "./types";

export function RequireAuth({ children }: PropsWithChildren) {
	const location = useLocation();
	const { user, isAuthenticating } = useAuth();

	if (isAuthenticating) {
		return <LoadingState label="Authenticating..." />;
	}

	if (!user) {
		return <Navigate to={routes.login} state={{ from: location }} replace />;
	}

	// Enforce mandatory password change before accessing protected routes
	if (
		user.must_change_password &&
		location.pathname !== routes.changePassword
	) {
		return <Navigate to={routes.changePassword} replace />;
	}

	return <>{children}</>;
}

export function RequirePermission({
	permission,
	mode = "all",
	children,
	fallback = null,
	redirect = true,
}: RequirePermissionProps) {
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

export function RequireTenant({ children }: PropsWithChildren) {
	const { currentOrgId, isLoading } = useTenant();

	if (isLoading) {
		return <LoadingState label="Loading tenant context..." />;
	}

	if (!currentOrgId) {
		return <Navigate to={routes.notAuthorized} replace />;
	}

	return <>{children}</>;
}
