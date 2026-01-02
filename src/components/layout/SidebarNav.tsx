import { NavLink } from "react-router-dom";
import { dashboardRoutes } from "@/app/dashboard-routes";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import type { SidebarNavProps } from "./types";

export function SidebarNav({ onNavigate }: SidebarNavProps) {
	const { can } = usePermissions();
	const visibleRoutes = dashboardRoutes.filter(
		(route) => !route.requiredPermission || can(route.requiredPermission),
	);

	return (
		<nav className="space-y-2">
			{visibleRoutes.map((item) => {
				const Icon = item.icon;
				return (
					<NavLink
						key={item.path}
						to={item.path}
						onClick={onNavigate}
						className={({ isActive }) =>
							cn(
								"group flex items-center gap-4 rounded-md px-4 py-3 text-sm font-semibold transition-colors",
								isActive
									? "bg-primary text-primary-foreground shadow-sm"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)
						}
					>
						<Icon className="h-5 w-5" aria-hidden="true" />
						<span>{item.label}</span>
					</NavLink>
				);
			})}
		</nav>
	);
}
