import {
	Coins,
	LayoutDashboard,
	Megaphone,
	Settings,
	Shield,
	Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { routes } from "@/lib/routes";

export interface DashboardRoute {
	label: string;
	path: string;
	icon: LucideIcon;
	requiredPermission?: string;
}

export const dashboardRoutes: DashboardRoute[] = [
	{
		label: "Dashboard",
		path: routes.overview,
		icon: LayoutDashboard,
	},
	{
		label: "Users",
		path: routes.users,
		icon: Users,
		requiredPermission: "user.view",
	},
	{
		label: "Roles",
		path: routes.roles,
		icon: Shield,
		requiredPermission: "role.view",
	},
	{
		label: "Departments",
		path: routes.departments,
		icon: Settings,
		requiredPermission: "department.view",
	},
	{
		label: "Announcements",
		path: routes.announcements,
		icon: Megaphone,
		requiredPermission: "announcement.view",
	},
	{
		label: "Stock admin",
		path: routes.stockAdmin,
		icon: Coins,
		requiredPermission: "stock.grant.view",
	},
	{
		label: "Org settings",
		path: routes.orgSettings,
		icon: Settings,
		requiredPermission: "org.settings.view",
	},
];

export function getRouteLabel(pathname: string) {
	const match = dashboardRoutes.find((route) => pathname.startsWith(route.path));
	return match?.label ?? "Dashboard";
}
