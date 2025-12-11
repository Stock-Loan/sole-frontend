import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LoadingStateProps } from "./types";

export function LoadingState({
	label = "Loading...",
	className,
}: LoadingStateProps) {
	return (
		<div
			className={cn(
				"flex items-center justify-center py-10 text-muted-foreground",
				className
			)}
		>
			<div className="flex items-center gap-2">
				<Loader2 className="h-5 w-5 animate-spin" />
				<span className="text-sm font-medium">{label}</span>
			</div>
		</div>
	);
}
