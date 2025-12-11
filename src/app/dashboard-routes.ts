import {
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
}

export const dashboardRoutes: DashboardRoute[] = [
	{ label: "Overview", path: routes.overview, icon: LayoutDashboard },
	{ label: "Users", path: routes.users, icon: Users },
	{ label: "Roles", path: routes.roles, icon: Shield },
	{ label: "Departments", path: routes.departments, icon: Settings },
	{ label: "Announcements", path: routes.announcements, icon: Megaphone },
	{ label: "Org settings", path: routes.orgSettings, icon: Settings },
];

export function getRouteLabel(pathname: string) {
	const match = dashboardRoutes.find((route) => pathname.startsWith(route.path));
	return match?.label ?? "Dashboard";
}
