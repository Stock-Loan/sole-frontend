import { cn } from "@/shared/lib/utils";
import type { SkeletonProps } from "./skeleton.types";

export function Skeleton({ className }: SkeletonProps) {
	return (
		<div
			aria-hidden="true"
			className={cn("animate-pulse rounded-md bg-muted/60", className)}
		/>
	);
}
