import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import type { SidebarItemProps } from "./types";

export function SidebarItem({ item, collapsed = false, isActive, onNavigate }: SidebarItemProps) {
	const Icon = item.icon;

	return (
		<NavLink
			to={item.path}
			onClick={onNavigate}
			className={cn(
				"group flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
				isActive
					? "bg-primary/10 text-primary"
					: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
				collapsed ? "justify-center" : "justify-start"
			)}
			aria-current={isActive ? "page" : undefined}
		>
			<Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
			<span
				className={cn(
					"overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
					collapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-3"
				)}
			>
				{item.label}
			</span>
		</NavLink>
	);
}
