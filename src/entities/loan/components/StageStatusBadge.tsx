import { Badge } from "@/shared/ui/badge";
import { cn, normalizeDisplay } from "@/shared/lib/utils";
import type { StageStatusBadgeProps } from "@/entities/loan/components/types";

export function StageStatusBadge({ status, className }: StageStatusBadgeProps) {
	const variant =
		status === "COMPLETED"
			? "border-emerald-200 bg-emerald-50 text-emerald-700"
			: status === "IN_PROGRESS"
				? "border-amber-200 bg-amber-50 text-amber-700"
				: "border-slate-200 bg-slate-50 text-slate-600";

	return (
		<Badge variant="secondary" className={cn(variant, className)}>
			{normalizeDisplay(status)}
		</Badge>
	);
}
