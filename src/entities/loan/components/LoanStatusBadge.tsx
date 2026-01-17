import { Badge } from "@/shared/ui/badge";
import { cn } from "@/shared/lib/utils";
import type { LoanStatusBadgeProps } from "@/entities/loan/components/types";

export function LoanStatusBadge({ status, className }: LoanStatusBadgeProps) {
	const variant =
		status === "SUBMITTED"
			? "border-blue-200 bg-blue-50 text-blue-700"
			: status === "IN_REVIEW"
				? "border-amber-200 bg-amber-50 text-amber-700"
			: status === "ACTIVE"
				? "border-emerald-200 bg-emerald-50 text-emerald-700"
			: status === "COMPLETED"
				? "border-emerald-200 bg-emerald-50 text-emerald-700"
				: status === "REJECTED"
					? "border-red-200 bg-red-50 text-red-700"
					: status === "CANCELLED"
						? "border-slate-200 bg-slate-50 text-slate-600"
							: "border-border bg-muted text-muted-foreground";

	return (
		<Badge variant="secondary" className={cn(variant, className)}>
			{status}
		</Badge>
	);
}
