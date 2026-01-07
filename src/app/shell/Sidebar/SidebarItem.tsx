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
				"group flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition",
				isActive
					? "bg-primary/10 text-primary"
					: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
				collapsed && "justify-center px-2"
			)}
			aria-current={isActive ? "page" : undefined}
		>
			<Icon className="h-4 w-4" aria-hidden="true" />
			{collapsed ? (
				<span className="sr-only">{item.label}</span>
			) : (
				<span>{item.label}</span>
			)}
		</NavLink>
	);
}
