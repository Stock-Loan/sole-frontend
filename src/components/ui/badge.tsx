import * as React from "react";
import { cn } from "@/lib/utils";
import { badgeVariants } from "./badge-variants";

export type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
	variant?: BadgeVariant;
}

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
