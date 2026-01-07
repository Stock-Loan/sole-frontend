import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { badgeVariants } from "./badge-variants";
import type { BadgeProps } from "./badge.types";

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
	({ className, variant = "default", ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={cn(badgeVariants({ variant }), className)}
				{...props}
			/>
		);
	}
);
Badge.displayName = "Badge";

export type { BadgeProps, BadgeVariant } from "./badge.types";
