import { cn } from "@/shared/lib/utils";
import { Skeleton } from "./Skeleton";
import type { LoadingStateProps } from "./types";

export function LoadingState({
	label = "Loading...",
	className,
}: LoadingStateProps) {
	return (
		<div
			role="status"
			aria-live="polite"
			className={cn(
				"mx-auto w-full max-w-xl space-y-3 py-6",
				className,
			)}
		>
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<div className="space-y-2.5">
				<Skeleton className="h-10 w-full" />
				<Skeleton className="h-10 w-[92%]" />
				<Skeleton className="h-10 w-[84%]" />
			</div>
		</div>
	);
}
