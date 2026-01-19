import type { NavItem } from "@/app/navigation/types";

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
