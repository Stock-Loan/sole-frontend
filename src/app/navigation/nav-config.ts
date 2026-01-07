import { BarChart3, ClipboardCheck, ClipboardList, Cog, FolderOpen, Gauge, Megaphone, Settings, Shield, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PermissionCode } from "@/shared/types/permissionCodes";
import type { AreaId } from "./areas";

export interface NavItem {
	id: string;
	label: string;
	path: string;
	icon: LucideIcon;
	permissions?: PermissionCode | PermissionCode[];
}

export type NavConfig = Record<AreaId, NavItem[]>;

export const navConfig: NavConfig = {
	workspace: [
		{
			id: "workspace-overview",
			label: "Overview",
			path: "/app/workspace",
			icon: Gauge,
			permissions: "org.dashboard.view",
		},
		{
			id: "workspace-settings",
			label: "My settings",
			path: "/app/workspace/settings",
			icon: Settings,
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
		{
			id: "workflows-requests",
			label: "Requests",
			path: "/app/workflows/requests",
			icon: ClipboardCheck,
			permissions: [
				"loan.workflow.hr.manage",
				"loan.workflow.finance.manage",
				"loan.workflow.legal.manage",
			],
		},
	],
	loans: [
		{
			id: "loans-applications",
			label: "Applications",
			path: "/app/loans",
			icon: BarChart3,
			permissions: ["loan.apply", "loan.view_all", "loan.view_own"],
		},
		{
			id: "loans-schedules",
			label: "Schedules",
			path: "/app/loans/schedules",
			icon: ClipboardList,
			permissions: ["loan.schedule.view", "loan.schedule.self.view"],
		},
	],
	stock: [
		{
			id: "stock-grants",
			label: "Grants",
			path: "/app/stock",
			icon: ClipboardList,
			permissions: ["stock.grant.view", "stock.program.view"],
		},
		{
			id: "stock-vesting",
			label: "Vesting",
			path: "/app/stock/vesting",
			icon: BarChart3,
			permissions: ["stock.vesting.view", "stock.self.view"],
		},
	],
	people: [
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
			id: "documents-library",
			label: "Documents",
			path: "/app/documents",
			icon: FolderOpen,
			permissions: ["loan.document.view", "loan.document.self_view"],
		},
		{
			id: "documents-templates",
			label: "Templates",
			path: "/app/documents/templates",
			icon: FolderOpen,
			permissions: ["loan.document.manage_hr", "loan.document.manage_finance"],
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
