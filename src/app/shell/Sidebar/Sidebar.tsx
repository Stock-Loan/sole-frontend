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

	const activeItemId = useMemo(() => {
		let bestMatchId: string | null = null;
		let bestMatchLength = -1;

		for (const item of visibleItems) {
			const path = item.path;
			// Match exact path or sub-path (e.g. /users matches /users/123, but /users shouldn't match /users-extra)
			const isMatch =
				location.pathname === path || location.pathname.startsWith(`${path}/`);

			if (isMatch && path.length > bestMatchLength) {
				bestMatchId = item.id;
				bestMatchLength = path.length;
			}
		}
		return bestMatchId;
	}, [visibleItems, location.pathname]);

	return (
		<aside
			className={cn(
				"relative flex h-screen flex-col border-r border-border/60 bg-background/80 backdrop-blur transition-[width] duration-300",
				collapsed ? "w-24" : "w-50"
			)}
		>
			<Button
				variant="ghost"
				size="icon"
				className="absolute -right-3 top-20 z-50 h-6 w-6 rounded-full border border-border bg-background p-0 shadow-sm hover:bg-accent focus-visible:ring-offset-0"
				onClick={handleToggle}
				aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
			>
				<ChevronLeft className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} />
			</Button>

			<div className={cn("flex items-center px-6 py-5", collapsed && "justify-center px-0")}>
				<Logo showTagline={!collapsed} size="sm" />
			</div>

			<div className={cn("px-6 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mt-4", collapsed && "text-center px-0")}>
				{collapsed ? "..." : activeArea.label}
			</div>

			<nav className={cn("flex-1 space-y-3 mt-4", collapsed ? "px-2" : "pl-6 pr-3")}>
				{visibleItems.length === 0 ? (
					<div className={cn("rounded-lg border border-dashed border-border/60 px-3 py-3 text-xs text-muted-foreground", collapsed && "px-2 text-center")}>
						{collapsed ? "—" : "No visible sections"}
					</div>
				) : (
					visibleItems.map((item) => (
						<SidebarItem
							key={item.id}
							item={item}
							collapsed={collapsed}
							isActive={item.id === activeItemId}
							onNavigate={onNavigate}
						/>
					))
				)}
			</nav>
		</aside>
	);
}
