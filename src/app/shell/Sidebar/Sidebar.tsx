import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Logo } from "@/shared/ui/Logo";
import { Button } from "@/shared/ui/Button";
import { usePermissions } from "@/auth/hooks";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { cn } from "@/shared/lib/utils";
import { getNavItems } from "@/app/navigation/nav-config";
import { useActiveArea } from "@/app/navigation/useActiveArea";
import { PermissionGate } from "@/app/permissions/PermissionGate";
import { SidebarItem } from "./SidebarItem";
import type { SidebarProps } from "./types";

function canSeeItem(
	can: (needed: string | string[]) => boolean,
	permission?: string | string[]
) {
	if (!permission) return true;
	const required = Array.isArray(permission) ? permission : [permission];
	return required.some((perm) => can(perm));
}

export function Sidebar({ collapsed: collapsedProp, onCollapseChange, onNavigate }: SidebarProps) {
	const location = useLocation();
	const activeArea = useActiveArea();
	const { can } = usePermissions();
	const [storedCollapsed, setStoredCollapsed] = useLocalStorage(
		"sole.sidebar.collapsed",
		false
	);
	const collapsed = collapsedProp ?? storedCollapsed;

	const handleToggle = () => {
		const next = !collapsed;
		setStoredCollapsed(next);
		onCollapseChange?.(next);
	};

	const navItems = useMemo(() => getNavItems(activeArea.id), [activeArea.id]);
	const visibleItems = useMemo(
		() => navItems.filter((item) => canSeeItem(can, item.permissions)),
		[navItems, can]
	);

	return (
		<aside
			className={cn(
				"flex h-screen flex-col border-r border-border/60 bg-background/80 backdrop-blur",
				collapsed ? "w-20" : "w-64"
			)}
		>
			<div className={cn("flex items-center gap-3 px-4 py-4", collapsed && "justify-center")}>
				<Logo showTagline={!collapsed} size="sm" className={cn(collapsed && "px-0")} />
				<Button
					variant="ghost"
					size="icon"
					className={cn("ml-auto", collapsed && "hidden")}
					onClick={handleToggle}
					aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
				>
					<ChevronLeft className={cn("h-4 w-4 transition", collapsed && "rotate-180")} />
				</Button>
			</div>
			{collapsed ? (
				<Button
					variant="ghost"
					size="icon"
					className="mx-auto mb-2"
					onClick={handleToggle}
					aria-label="Expand sidebar"
				>
					<ChevronLeft className="h-4 w-4 rotate-180" />
				</Button>
			) : null}
			<div className="px-4 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
				{activeArea.label}
			</div>
			<nav className={cn("flex-1 space-y-1 px-2", collapsed && "px-1")}>
				{visibleItems.length === 0 ? (
					<div className={cn("rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground", collapsed && "px-2 text-center")}>
						{collapsed ? "—" : "No visible sections"}
					</div>
				) : (
					navItems.map((item) => (
						<PermissionGate key={item.id} permission={item.permissions} mode="any">
							<SidebarItem
								item={item}
								collapsed={collapsed}
								isActive={location.pathname.startsWith(item.path)}
								onNavigate={onNavigate}
							/>
						</PermissionGate>
					))
				)}
			</nav>
		</aside>
	);
}
