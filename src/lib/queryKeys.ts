import type { OrgUsersListParams } from "@/features/org-users/types";

export const queryKeys = {
	orgUsers: {
		list: (params?: OrgUsersListParams) =>
			["org-users", "list", params ?? {}] as const,
		detail: (membershipId: string) =>
			["org-users", "detail", membershipId] as const,
	},
};
