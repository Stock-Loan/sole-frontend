import type { OrgUsersListParams } from "@/features/org-users/types";
import type { AnnouncementListParams } from "@/features/announcements/types";
import type { OrgSettingsUpdatePayload } from "@/features/org-settings/types";
import type { RoleListParams } from "@/features/roles/types";
import type { DepartmentListParams } from "@/features/departments/types";
import type { StockDashboardSummaryParams } from "@/features/dashboard/types";
import type {
	StockGrantListParams,
	StockSummaryParams,
} from "@/features/stock/types";

export const queryKeys = {
	auth: {
		me: () => ["auth", "me"] as const,
		selfContext: (orgId?: string | null) =>
			["auth", "self-context", orgId ?? "current"] as const,
	},
	roles: {
		list: (params?: RoleListParams) =>
			["roles", "list", params ?? {}] as const,
		detail: (roleId: string) => ["roles", "detail", roleId] as const,
		forUser: (membershipId: string) =>
			["roles", "for-user", membershipId] as const,
	},
	orgUsers: {
		list: (params?: OrgUsersListParams) =>
			["org-users", "list", params ?? {}] as const,
		detail: (membershipId: string) =>
			["org-users", "detail", membershipId] as const,
		currentUser: (email: string) => ["org-users", "current", email] as const,
	},
	orgUsersBulk: {
		result: () => ["org-users", "bulk", "result"] as const,
	},
	departments: {
		list: (params?: DepartmentListParams) =>
			["departments", "list", params ?? {}] as const,
		detail: (departmentId: string) =>
			["departments", "detail", departmentId] as const,
	},
	meta: {
		timezones: () => ["meta", "timezones"] as const,
		countries: () => ["meta", "countries"] as const,
		subdivisions: (countryCode: string) =>
			["meta", "subdivisions", countryCode] as const,
	},
	announcements: {
		list: (params?: AnnouncementListParams) =>
			["announcements", "list", params ?? {}] as const,
		detail: (id: string) => ["announcements", "detail", id] as const,
		unread: () => ["announcements", "unread"] as const,
		unreadCount: () => ["announcements", "unread", "count"] as const,
		adminList: (params?: AnnouncementListParams) =>
			["announcements", "admin", params ?? {}] as const,
	},
	orgSettings: {
		get: () => ["org-settings", "get"] as const,
		update: (payload?: OrgSettingsUpdatePayload) =>
			["org-settings", "update", payload ?? {}] as const,
	},
	dashboard: {
		stockSummary: (params?: StockDashboardSummaryParams) =>
			["dashboard", "stock-summary", params ?? {}] as const,
	},
	stock: {
		grants: {
			list: (membershipId: string, params?: StockGrantListParams) =>
				["stock", "grants", "list", membershipId, params ?? {}] as const,
		},
		summary: (membershipId: string, params?: StockSummaryParams) =>
			["stock", "summary", membershipId, params ?? {}] as const,
	},
};
