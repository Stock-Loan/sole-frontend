import { NavLink } from "react-router-dom";
import { cn } from "@/shared/lib/utils";
import type { SidebarItemProps } from "./types";

export function SidebarItem({
	item,
	collapsed = false,
	isActive,
	onNavigate,
}: SidebarItemProps) {
	const Icon = item.icon;

	return (
		<NavLink
			to={item.path}
			onClick={onNavigate}
			className={cn(
				"group relative flex items-center rounded-lg px-3 py-3 text-sm font-medium transition-colors",
				isActive
					? "bg-primary/10 text-primary"
					: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
				collapsed ? "justify-center" : "justify-start",
			)}
			aria-current={isActive ? "page" : undefined}
		>
			<Icon
				className={cn(
					"h-5 w-5 shrink-0",
					isActive
						? "text-primary"
						: "text-foreground/70 group-hover:text-foreground",
				)}
				aria-hidden="true"
			/>
			<span
				className={cn(
					"overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out",
					collapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-3",
				)}
			>
				{item.label}
			</span>
			{collapsed ? (
				<span className="pointer-events-none absolute left-full top-1/2 z-[100] ml-3 -translate-y-1/2 whitespace-nowrap rounded-xl border border-border/60 bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground opacity-0 shadow-xl backdrop-blur transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0">
					{item.label}
				</span>
			) : null}
		</NavLink>
	);
}
