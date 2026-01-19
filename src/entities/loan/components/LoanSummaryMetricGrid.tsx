import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { colorPalette } from "@/shared/styles/color-palette";
import type { LoanSummaryMetricGridProps } from "@/entities/loan/components/types";

export function LoanSummaryMetricGrid({ metrics }: LoanSummaryMetricGridProps) {
	const cardStyle = {
		borderColor: colorPalette.slate[200],
		backgroundColor: colorPalette.semantic.surface,
	};
	const labelStyle = { color: colorPalette.slate[500] };
	const valueStyle = { color: colorPalette.navy[900] };

	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			{metrics.map((metric) => (
				<Card
					key={metric.label}
					style={cardStyle}
					className="relative overflow-hidden"
				>
					<div
						className="absolute left-0 top-0 h-full w-1"
						style={{ backgroundColor: colorPalette.semantic.primary }}
					/>
					<CardHeader className="pb-2">
						<CardTitle
							className="text-xs font-semibold uppercase tracking-wide"
							style={labelStyle}
						>
							{metric.label}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-1">
						<p className="text-2xl font-semibold" style={valueStyle}>
							{metric.value}
						</p>
						{metric.helper ? (
							<p className="text-xs text-muted-foreground">{metric.helper}</p>
						) : null}
					</CardContent>
				</Card>
			))}
		</div>
	);
}
