import { NavLink } from "react-router-dom";
import { dashboardRoutes } from "@/app/dashboard-routes";
import { cn } from "@/lib/utils";

interface SidebarNavProps {
	onNavigate?: () => void;
}

export function SidebarNav({ onNavigate }: SidebarNavProps) {
	return (
		<nav className="space-y-1">
			{dashboardRoutes.map((item) => {
				const Icon = item.icon;
				return (
					<NavLink
						key={item.path}
						to={item.path}
						onClick={onNavigate}
						className={({ isActive }) =>
							cn(
								"group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
								isActive
									? "bg-primary text-primary-foreground shadow-sm"
									: "text-muted-foreground hover:bg-muted hover:text-foreground",
							)
						}
					>
						<Icon className="h-4 w-4" aria-hidden="true" />
						<span>{item.label}</span>
					</NavLink>
				);
			})}
		</nav>
	);
}
