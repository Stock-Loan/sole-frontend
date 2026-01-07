import type { PropsWithChildren, ReactNode } from "react";
import type { PermissionCode } from "./permissionCodes";

export interface PermissionGateProps extends PropsWithChildren {
	permission?: PermissionCode | PermissionCode[];
	mode?: "all" | "any";
	fallback?: ReactNode;
	redirect?: boolean;
}
