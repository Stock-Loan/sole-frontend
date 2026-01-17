import type { RoleListParams } from "./types";
import type { OrgUsersListParams } from "@/entities/user/types";

export const roleKeys = {
	list: (params?: RoleListParams) => ["roles", "list", params ?? {}] as const,
	detail: (roleId: string) => ["roles", "detail", roleId] as const,
	forUser: (membershipId: string) => ["roles", "for-user", membershipId] as const,
	members: (roleId: string, params?: OrgUsersListParams) =>
		["roles", "members", roleId, params ?? {}] as const,
	memberLookup: (roleId: string, userId: string) =>
		["roles", "member-lookup", roleId, userId] as const,
};
