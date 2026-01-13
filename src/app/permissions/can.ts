import type { AuthUser } from "@/auth/types";
import type {
	PermissionCheckOptions,
	PermissionRequirement,
} from "@/app/permissions/types";

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
