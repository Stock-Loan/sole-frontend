import type { Role } from "@/entities/role/types";
import { normalizeDisplay } from "@/shared/lib/utils";
import type { MembershipRole, OrgMembershipDto } from "./types";
type SelfContextRole = {
	id: string;
	name?: string | null;
};

type SelfContextResponseLike = {
	roles?: SelfContextRole[];
};

export function getMembershipRoleIds(membership?: OrgMembershipDto): string[] {
	if (!membership) return [];
	const rawRoles: MembershipRole[] =
		(membership.roles as MembershipRole[]) ?? [];
	const idsFromRoles = rawRoles
		.map((role) => (typeof role === "string" ? role : role?.id))
		.filter(Boolean);
	const roleIds = membership.role_ids ?? [];
	return Array.from(new Set([...idsFromRoles, ...roleIds]));
}

export function getMembershipRoleNames(
	membership: OrgMembershipDto | undefined,
	availableRoles: Role[] = [],
): string[] {
	if (!membership) return [];

	const ids = getMembershipRoleIds(membership);
	const namesFromRoles = ((membership.roles as MembershipRole[]) ?? [])
		.map((role) =>
			typeof role === "string"
				? role
				: role?.name
		)
		.filter(Boolean) as string[];

	const namesFromLookup = ids
		.map((id) => availableRoles.find((role) => role.id === id)?.name)
		.filter(Boolean) as string[];

	const combined = [...namesFromRoles, ...namesFromLookup];
	const normalized = combined
		.map((name) => name.trim())
		.filter(Boolean)
		.map((name) => normalizeDisplay(name))
		.filter((name) => name !== "—");

	return Array.from(new Set(normalized));
}

export function getSelfContextRoleIds(
	context?: SelfContextResponseLike,
): string[] {
	if (!context?.roles) return [];
	return context.roles
		.map((role) => role.id)
		.filter(Boolean);
}

export function getSelfContextRoleNames(
	context?: SelfContextResponseLike,
): string[] {
	if (!context?.roles) return [];
	return Array.from(
		new Set(
			context.roles
				.map((role) => role.name || role.id)
				.filter(Boolean)
				.map((name) => normalizeDisplay(name))
				.filter((name) => name !== "—"),
		),
	);
}
