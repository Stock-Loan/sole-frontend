import type { PropsWithChildren, ReactNode } from "react";

export interface RequirePermissionProps extends PropsWithChildren {
	permission?: string | string[];
	mode?: "all" | "any";
	fallback?: ReactNode;
	redirect?: boolean;
}
