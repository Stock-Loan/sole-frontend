import type { OrgUsersListParams } from "./types";

export const userKeys = {
	list: (params?: OrgUsersListParams) =>
		["org-users", "list", params ?? {}] as const,
	search: (params?: OrgUsersListParams, fullTerm?: string) =>
		["org-users", "search", params ?? {}, fullTerm ?? ""] as const,
	detail: (membershipId: string) =>
		["org-users", "detail", membershipId] as const,
	currentUser: (email: string) => ["org-users", "current", email] as const,
	bulkResult: () => ["org-users", "bulk", "result"] as const,
};
