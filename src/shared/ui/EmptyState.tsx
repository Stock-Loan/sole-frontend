import { AlertCircle } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { EmptyStateProps } from "./types";

export function EmptyState({
	title = "Nothing to show yet",
	message,
	actionLabel = "Retry",
	onRetry,
	icon,
	className,
}: EmptyStateProps) {
	return (
		<div
			className={cn(
				"flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/20 p-8 text-center",
				className
			)}
		>
			<div className="text-primary">
				{icon ?? <AlertCircle className="h-6 w-6" aria-hidden="true" />}
			</div>
			<div className="space-y-1">
				<h3 className="text-base font-semibold">{title}</h3>
				<p className="text-sm text-muted-foreground">{message}</p>
			</div>
			{onRetry ? (
				<Button onClick={onRetry} variant="outline" size="sm">
					{actionLabel}
				</Button>
			) : null}
		</div>
	);
}
