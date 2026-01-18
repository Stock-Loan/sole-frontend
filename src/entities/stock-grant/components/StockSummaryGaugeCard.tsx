import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { colorPalette } from "@/app/styles/color-palette";
import { formatPercent } from "@/shared/lib/format";
import type { StockSummaryGaugeCardProps } from "@/entities/stock-grant/components/types";

export function StockSummaryGaugeCard({
	title,
	value,
	helper,
	color,
}: StockSummaryGaugeCardProps) {
	const normalized = Number.isFinite(value) ? Math.min(Math.max(value, 0), 100) : 0;
	const stroke = color ?? colorPalette.semantic.primary;
	const gradient = `conic-gradient(${stroke} ${normalized * 3.6}deg, ${colorPalette.slate[100]} ${normalized * 3.6}deg)`;

	return (
		<Card className="h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col items-center gap-4">
				<div
					className="relative h-40 w-40 rounded-full shadow-md"
					style={{ background: gradient }}
					aria-label={`${title} gauge`}
				>
					<div className="absolute inset-4 rounded-full bg-background shadow-inner" />
					<div className="absolute inset-0 flex flex-col items-center justify-center">
						<span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
							Rate
						</span>
						<span className="text-2xl font-semibold text-foreground">
							{formatPercent(normalized)}
						</span>
					</div>
				</div>
				{helper ? (
					<p className="text-center text-xs text-muted-foreground">{helper}</p>
				) : null}
			</CardContent>
		</Card>
	);
}
