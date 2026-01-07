import { cn } from "@/shared/lib/utils";
import type { FilterBarProps } from "./types";

export function FilterBar({ children, className }: FilterBarProps) {
	return (
		<div
			className={cn(
				"flex flex-wrap items-center gap-3 rounded-lg border border-border/70 bg-card/50 px-3 py-3 shadow-sm",
				className
			)}
		>
			{children}
		</div>
	);
}
