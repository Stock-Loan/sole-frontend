import type { NavItem } from "@/app/navigation/nav-config";

export interface SidebarItemProps {
	item: NavItem;
	collapsed?: boolean;
	isActive?: boolean;
	onNavigate?: () => void;
}

export interface SidebarProps {
	collapsed?: boolean;
	onCollapseChange?: (collapsed: boolean) => void;
	onNavigate?: () => void;
}
