import {
	ClipboardList,
	Coins,
	FileText,
	FolderOpen,
	LayoutDashboard,
	Megaphone,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AreaId =
	| "workspace"
	| "workflows"
	| "loans"
	| "stock"
	| "people"
	| "documents"
	| "announcements"
	| "settings"
	| "admin";

export interface AppArea {
	id: AreaId;
	label: string;
	icon: LucideIcon;
	path: string;
	description?: string;
}

export const areas: AppArea[] = [
	{
		id: "workspace",
		label: "Workspace",
		icon: LayoutDashboard,
		path: "/app/workspace",
		description: "Personal dashboard and self-service",
	},
	{
		id: "workflows",
		label: "Workflows",
		icon: ClipboardList,
		path: "/app/workflows",
		description: "Review and approve stock loan requests",
	},
	{
		id: "loans",
		label: "Loans",
		icon: FileText,
		path: "/app/loans",
		description: "Loan applications, schedules, and repayments",
	},
	{
		id: "stock",
		label: "Stock",
		icon: Coins,
		path: "/app/stock",
		description: "Grants, vesting, and program oversight",
	},
	{
		id: "people",
		label: "People",
		icon: Users,
		path: "/app/people",
		description: "Users, roles, and departments",
	},
	{
		id: "documents",
		label: "Documents",
		icon: FolderOpen,
		path: "/app/documents",
		description: "Templates and document packets",
	},
	{
		id: "announcements",
		label: "Announcements",
		icon: Megaphone,
		path: "/app/announcements",
		description: "Organization-wide messaging",
	},
	{
		id: "settings",
		label: "Settings",
		icon: Settings,
		path: "/app/settings",
		description: "Organization configuration and audits",
	},
	{
		id: "admin",
		label: "Admin",
		icon: Shield,
		path: "/app/admin",
		description: "System-level controls and flags",
	},
];

export const defaultAreaId: AreaId = "workspace";

export function getAreaById(areaId: AreaId) {
	return areas.find((area) => area.id === areaId) ?? null;
}

export function getDefaultArea() {
	return getAreaById(defaultAreaId) ?? areas[0];
}
