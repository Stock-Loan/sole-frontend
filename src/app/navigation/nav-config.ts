import { BarChart3, ClipboardList, Cog, FileText, FolderOpen, Gauge, Megaphone, Settings, Shield, Users } from "lucide-react";
import type { AreaId, NavConfig } from "@/app/navigation/types";

export const navConfig: NavConfig = {
	workspace: [
		{
			id: "workspace-overview",
			label: "Overview",
			path: "/app/workspace",
			icon: Gauge,
		},
		{
			id: "workspace-loans",
			label: "My loans",
			path: "/app/workspace/loans",
			icon: FileText,
			permissions: "loan.view_own",
		},
		{
			id: "workspace-documents",
			label: "My documents",
			path: "/app/workspace/documents",
			icon: FolderOpen,
			permissions: ["loan.document.self_view", "loan.document.self_upload_83b"],
		},
	],
	workflows: [
		{
			id: "workflows-queue",
			label: "Queue",
			path: "/app/workflows",
			icon: ClipboardList,
			permissions: [
				"loan.queue.hr.view",
				"loan.queue.finance.view",
				"loan.queue.legal.view",
			],
		},
	],
	loans: [
		{
			id: "loans-summary",
			label: "Summary",
			path: "/app/loans",
			icon: BarChart3,
			permissions: "loan.dashboard.view",
		},
		{
			id: "loans-applications",
			label: "Applications",
			path: "/app/loans/applications",
			icon: FileText,
			permissions: ["loan.view_all", "loan.manage"],
		},
	],
	stock: [
		{
			id: "stock-dashboard",
			label: "Summary",
			path: "/app/stock",
			icon: Gauge,
			permissions: "stock.dashboard.view",
		},
		{
			id: "stock-admin",
			label: "Administration",
			path: "/app/stock/manage",
			icon: Users,
			permissions: [
				"stock.vesting.view",
				"stock.eligibility.view",
			],
		},
		{
			id: "stock-grants",
			label: "Grants",
			path: "/app/stock/grants",
			icon: ClipboardList,
			permissions: ["stock.view", "stock.manage"],
		},
		{
			id: "stock-vesting",
			label: "Vesting",
			path: "/app/stock/vesting",
			icon: BarChart3,
			permissions: ["stock.view", "stock.manage"],
		},
	],
	people: [
		{
			id: "people-summary",
			label: "Summary",
			path: "/app/people/summary",
			icon: BarChart3,
			permissions: "user.view",
		},
		{
			id: "people-users",
			label: "Users",
			path: "/app/people/users",
			icon: Users,
			permissions: "user.view",
		},
		{
			id: "people-roles",
			label: "Roles",
			path: "/app/people/roles",
			icon: Shield,
			permissions: "role.view",
		},
		{
			id: "people-departments",
			label: "Departments",
			path: "/app/people/departments",
			icon: Cog,
			permissions: "department.view",
		},
	],
	documents: [
		{
			id: "documents-templates",
			label: "Templates",
			path: "/app/documents",
			icon: FolderOpen,
			permissions: [
				"loan.document.manage_hr",
				"loan.document.manage_finance",
				"loan.document.manage_legal",
			],
		},
	],
	announcements: [
		{
			id: "announcements-feed",
			label: "Announcements",
			path: "/app/announcements",
			icon: Megaphone,
			permissions: "announcement.view",
		},
	],
	settings: [
		{
			id: "settings-org",
			label: "Org settings",
			path: "/app/settings/org",
			icon: Settings,
			permissions: "org.settings.view",
		},
		{
			id: "settings-audit",
			label: "Audit logs",
			path: "/app/settings/audit",
			icon: ClipboardList,
			permissions: "audit_log.view",
		},
	],
	admin: [
		{
			id: "admin-tenancy",
			label: "Tenancy",
			path: "/app/admin/tenancy",
			icon: Shield,
			permissions: "system.admin",
		},
		{
			id: "admin-flags",
			label: "Feature flags",
			path: "/app/admin/feature-flags",
			icon: Shield,
			permissions: "system.admin",
		},
	],
};

export function getNavItems(areaId: AreaId) {
	return navConfig[areaId] ?? [];
}
