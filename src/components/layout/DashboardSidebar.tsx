import { Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Logo } from "@/components/common/Logo";
import { SidebarNav } from "./SidebarNav";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { DashboardSidebarProps } from "./types";

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
	return (
		<aside className="hidden h-screen w-64 bg-card/80 px-4 py-8 shadow-sm backdrop-blur lg:flex lg:flex-col">
			<div className="mb-10 space-y-6">
				<Logo />
			</div>
			<div className="flex flex-1 flex-col gap-6">
				<SidebarNav onNavigate={onNavigate} />
				<div className="mt-auto space-y-3 pt-6">
					<NavLink
						to={routes.userSettings}
						className={({ isActive }) =>
							cn(
								"flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold transition",
								isActive
									? "bg-primary text-primary-foreground shadow-sm"
									: "text-muted-foreground hover:bg-muted hover:text-foreground"
							)
						}
					>
						<Settings className="h-5 w-5" aria-hidden="true" />
						<span>User settings</span>
					</NavLink>
				</div>
			</div>
		</aside>
	);
}
