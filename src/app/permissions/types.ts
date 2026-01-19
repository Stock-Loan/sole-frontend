import type { PropsWithChildren, ReactNode } from "react";
import type { PermissionCode } from "@/shared/permissions/types";

export * from "@/shared/permissions/types";

export interface PermissionGateProps extends PropsWithChildren {
	permission?: PermissionCode | PermissionCode[];
	mode?: "all" | "any";
	fallback?: ReactNode;
	redirect?: boolean;
}
