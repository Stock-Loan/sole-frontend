import type { AuthUser } from "@/auth/types";
import type { PermissionCode } from "@/app/permissions/permissionCodes";

export type PermissionRequirement = PermissionCode | PermissionCode[];
export type PermissionCheckMode = "all" | "any";

export interface PermissionCheckOptions {
	mode?: PermissionCheckMode;
}

function normalize(required?: PermissionRequirement) {
	if (!required) return [];
	return Array.isArray(required) ? required : [required];
}

export function canPermissions(
	permissions: string[] | undefined,
	required?: PermissionRequirement,
	options: PermissionCheckOptions = {}
) {
	const needed = normalize(required);
	if (needed.length === 0) return true;

	const list = permissions ?? [];
	const mode = options.mode ?? "all";

	return mode === "any"
		? needed.some((permission) => list.includes(permission))
		: needed.every((permission) => list.includes(permission));
}

export function can(
	user: Pick<AuthUser, "permissions" | "is_superuser"> | null | undefined,
	required?: PermissionRequirement,
	options: PermissionCheckOptions = {}
) {
	if (!required) return true;
	if (user?.is_superuser) return true;
	return canPermissions(user?.permissions, required, options);
}
