import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import { colorPalette } from "@/shared/styles/color-palette";
import type { StockSummaryTimelineCardProps } from "@/entities/stock-grant/components/types";

export function StockSummaryTimelineCard({
	title,
	events,
	emptyMessage = "No upcoming vesting events.",
}: StockSummaryTimelineCardProps) {
	if (!events.length) {
		return (
			<Card className="h-full">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">{title}</CardTitle>
				</CardHeader>
				<CardContent>
					<EmptyState title="No events" message={emptyMessage} />
				</CardContent>
			</Card>
		);
	}

	const maxShares = events.reduce(
		(acc, event) => Math.max(acc, event.shares),
		0,
	);

	return (
		<Card className="h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				{events.map((event) => {
					const ratio = maxShares > 0 ? event.shares / maxShares : 0;
					return (
						<div
							key={`${event.vest_date}-${event.shares}`}
							className="space-y-2"
						>
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>{formatDate(event.vest_date)}</span>
								<span className="font-semibold text-foreground">
									{formatShares(event.shares)} shares
								</span>
							</div>
							<div className="h-2 w-full rounded-full bg-slate-100">
								<div
									className="h-full rounded-full"
									style={{
										width: `${Math.max(ratio * 100, 6)}%`,
										backgroundColor: colorPalette.chart[2],
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
