import type { OrgUsersListParams } from "@/features/org-users/types";

export const queryKeys = {
	auth: {
		me: () => ["auth", "me"] as const,
		selfContext: (orgId?: string | null) =>
			["auth", "self-context", orgId ?? "current"] as const,
	},
	roles: {
		list: () => ["roles", "list"] as const,
		detail: (roleId: string) => ["roles", "detail", roleId] as const,
		forUser: (membershipId: string) =>
			["roles", "for-user", membershipId] as const,
	},
	orgUsers: {
		list: (params?: OrgUsersListParams) => ["org-users", "list", params ?? {}] as const,
		detail: (membershipId: string) => ["org-users", "detail", membershipId] as const,
		currentUser: (email: string) => ["org-users", "current", email] as const,
	},
	orgUsersBulk: {
		result: () => ["org-users", "bulk", "result"] as const,
	},
	meta: {
		timezones: () => ["meta", "timezones"] as const,
		countries: () => ["meta", "countries"] as const,
		subdivisions: (countryCode: string) =>
			["meta", "subdivisions", countryCode] as const,
	},
};
