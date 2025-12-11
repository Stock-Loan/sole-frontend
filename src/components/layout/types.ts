import type { RoleCode } from "@/features/auth/types";
import type { HTMLAttributes, ReactNode } from "react";

export interface PublicHeaderProps {
	actions?: ReactNode;
}
export interface ProtectedRouteProps {
	roles?: RoleCode[];
	children?: ReactNode;
}
export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
	fullHeight?: boolean;
}
