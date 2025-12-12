import type { OrgUsersListParams } from "@/features/org-users/types";

export const queryKeys = {
	orgUsers: {
		list: (params?: OrgUsersListParams) => ["org-users", "list", params ?? {}] as const,
		detail: (membershipId: string) => ["org-users", "detail", membershipId] as const,
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
