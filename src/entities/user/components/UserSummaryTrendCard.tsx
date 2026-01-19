import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { colorPalette } from "@/shared/styles/color-palette";
import type { UserSummaryTrendCardProps } from "@/entities/user/components/types";

export function UserSummaryTrendCard({
	title,
	items,
	total,
	emptyMessage = "No trend data available.",
}: UserSummaryTrendCardProps) {
	const max = items.reduce((acc, item) => Math.max(acc, item.value), 0);
	const base = total ?? max;

	if (!items.length || base === 0) {
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
			<CardContent className="space-y-3">
				{items.map((item, index) => {
					const ratio = base > 0 ? item.value / base : 0;
					const color =
						item.color ?? Object.values(colorPalette.chart)[index % 6];
					return (
						<div key={`${title}-${item.label}`} className="space-y-2">
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span className="text-foreground">{item.label}</span>
								<span className="tabular-nums">
									{item.value.toLocaleString()}
								</span>
							</div>
							<div className="h-2 w-full rounded-full bg-slate-100">
								<div
									className="h-2 rounded-full"
									style={{
										width: `${Math.max(4, ratio * 100)}%`,
										backgroundColor: color,
									}}
								/>
							</div>
						</div>
					);
				})}
			</CardContent>
		</Card>
	);
}
