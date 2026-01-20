import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { cn } from "@/shared/lib/utils";
import { colorPalette } from "@/shared/styles/color-palette";
import type { LoanSummaryBarChartProps } from "@/entities/loan/types";

export function LoanSummaryBarChart({
	title,
	items,
	total,
	emptyMessage = "No data available.",
	className,
	summary,
	chartHeightClassName,
}: LoanSummaryBarChartProps) {
	const max = items.reduce((acc, item) => Math.max(acc, item.value), 0);
	const sum = items.reduce((acc, item) => acc + item.value, 0);
	const base = total ?? (sum > 0 ? sum : max);

	return (
		<Card className={cn("h-full", className)}>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				{summary ? (
					<div className="space-y-3 text-sm text-muted-foreground">
						{summary}
					</div>
				) : null}
				{items.length === 0 || base === 0 ? (
					<EmptyState title="No data" message={emptyMessage} />
				) : (
					<div className={cn("space-y-4", summary ? "mt-4" : null)}>
						<div className="flex items-end gap-3 rounded-lg border border-dashed border-border/60 bg-slate-50/60 px-3 py-4">
							{items.map((item, index) => {
								const ratio = base > 0 ? item.value / base : 0;
								const height = Math.max(4, Math.round(ratio * 100));
								const color =
									item.color ?? Object.values(colorPalette.chart)[index % 6];
								return (
									<div
										key={`${title}-${item.label}`}
										className="flex min-w-[70px] flex-1 flex-col items-center gap-2"
									>
										<div className="text-xs font-semibold tabular-nums text-foreground">
											{item.value.toLocaleString()}
										</div>
										<div
											className={cn(
												"relative flex w-full items-end justify-center",
												chartHeightClassName ?? "h-32",
											)}
										>
											<div
												className={cn("w-full rounded-md")}
												style={{
													height: `${height}%`,
													backgroundColor: color,
												}}
												aria-label={`${item.label} ${Math.round(ratio * 100)}%`}
											/>
										</div>
										<div className="text-center text-xs text-muted-foreground">
											{item.label}
										</div>
									</div>
								);
							})}
						</div>
						<div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
							{items.map((item, index) => {
								const color =
									item.color ?? Object.values(colorPalette.chart)[index % 6];
								return (
									<div
										key={`${title}-legend-${item.label}`}
										className="flex items-center gap-2"
									>
										<span
											className="h-2.5 w-2.5 rounded-full"
											style={{ backgroundColor: color }}
										/>
										<span>{item.label}</span>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
