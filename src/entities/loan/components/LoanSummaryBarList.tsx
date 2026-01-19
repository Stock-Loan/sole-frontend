import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { cn } from "@/shared/lib/utils";
import { colorPalette } from "@/shared/styles/color-palette";
import type { LoanSummaryBarListProps } from "@/entities/loan/components/types";

export function LoanSummaryBarList({
	title,
	items,
	total,
	emptyMessage = "No data available.",
}: LoanSummaryBarListProps) {
	const sum = total ?? items.reduce((acc, item) => acc + item.value, 0);
	const max = items.reduce((acc, item) => Math.max(acc, item.value), 0);
	const shouldUseTotal = sum > 0;
	const base = shouldUseTotal ? sum : max;

	return (
		<Card className="h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{items.length === 0 ? (
					<EmptyState title="No data" message={emptyMessage} />
				) : (
					<ul className="space-y-3">
						{items.map((item, index) => {
							const ratio = base > 0 ? item.value / base : 0;
							const width = Math.min(100, Math.max(0, ratio * 100));
							const color =
								item.color ?? Object.values(colorPalette.chart)[index % 6];
							return (
								<li key={`${title}-${item.label}`}>
									<div className="flex items-center justify-between text-xs text-muted-foreground">
										<span className="font-medium text-foreground">
											{item.label}
										</span>
										<span className="tabular-nums">
											{item.value.toLocaleString()}
											{shouldUseTotal ? (
												<span className="text-muted-foreground">
													{` • ${Math.round(ratio * 100)}%`}
												</span>
											) : null}
										</span>
									</div>
									<div
										className={cn(
											"mt-2 h-2 w-full overflow-hidden rounded-full",
											"bg-slate-100",
										)}
									>
										<div
											className="h-full rounded-full transition-all"
											style={{
												width: `${width}%`,
												backgroundColor: color,
											}}
										/>
									</div>
									{item.helper ? (
										<p className="mt-1 text-xs text-muted-foreground">
											{item.helper}
										</p>
									) : null}
								</li>
							);
						})}
					</ul>
				)}
			</CardContent>
		</Card>
	);
}
