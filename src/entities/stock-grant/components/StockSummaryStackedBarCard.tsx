import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { colorPalette } from "@/shared/styles/color-palette";
import type { StockSummaryStackedBarCardProps } from "@/entities/stock-grant/components/types";

export function StockSummaryStackedBarCard({
	title,
	items,
	total,
	emptyMessage = "No data available.",
}: StockSummaryStackedBarCardProps) {
	const sum = items.reduce((acc, item) => acc + item.value, 0);
	const base = total ?? sum;

	if (!items.length || base <= 0) {
		return (
			<Card className="h-full">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<EmptyState title="No data" message={emptyMessage} />
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="overflow-hidden rounded-full border border-border/60 bg-slate-100">
					<div className="flex h-4 w-full">
						{items.map((item, index) => {
							const ratio = base > 0 ? item.value / base : 0;
							const color =
								item.color ?? Object.values(colorPalette.chart)[index % 6];
							return (
								<div
									key={`${title}-segment-${item.label}`}
									style={{
										width: `${Math.max(ratio * 100, 0)}%`,
										backgroundColor: color,
									}}
								/>
							);
						})}
					</div>
				</div>
				<div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-3">
					{items.map((item, index) => {
						const ratio = base > 0 ? item.value / base : 0;
						const color =
							item.color ?? Object.values(colorPalette.chart)[index % 6];
						return (
							<div
								key={`${title}-legend-${item.label}`}
								className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-white/80 px-3 py-2 shadow-sm"
							>
								<div className="flex items-center gap-2">
									<span
										className="h-2.5 w-2.5 rounded-full"
										style={{ backgroundColor: color }}
									/>
									<span className="text-foreground">{item.label}</span>
								</div>
								<span className="tabular-nums">
									{item.value.toLocaleString()} • {Math.round(ratio * 100)}%
								</span>
							</div>
						);
					})}
				</div>
			</CardContent>
		</Card>
	);
}
