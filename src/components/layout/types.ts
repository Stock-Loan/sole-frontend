import type { RoleCode } from "@/features/auth/types";
import type { HTMLAttributes, ReactNode } from "react";

export interface PublicHeaderProps {
	actions?: ReactNode;
}

export interface DashboardNavbarProps {
	onOpenMobileNav: () => void;
	currentLabel?: string;
}

export interface DashboardSidebarProps {
	onNavigate?: () => void;
}

export interface SidebarNavProps {
	onNavigate?: () => void;
}

export interface UserDropdownProps {
	showChevron?: boolean;
}

export interface PermissionGateProps {
	permission?: string | string[];
	children: ReactNode;
	fallback?: ReactNode;
	redirect?: boolean;
}

export interface ProtectedRouteProps {
	roles?: RoleCode[];
	children?: ReactNode;
}
export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
	fullHeight?: boolean;
}
