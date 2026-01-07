export function can(
	userPermissions: string[] | undefined,
	needed: string | string[],
): boolean {
	if (!needed) return true;
	const permissions = userPermissions ?? [];
	const required = Array.isArray(needed) ? needed : [needed];
	return required.every((perm) => permissions.includes(perm));
}
