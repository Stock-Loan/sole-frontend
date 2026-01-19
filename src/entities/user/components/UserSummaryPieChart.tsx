import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { colorPalette } from "@/shared/styles/color-palette";
import type { UserSummaryPieChartProps } from "@/entities/user/components/types";

function buildGradient(
	items: UserSummaryPieChartProps["items"],
	total: number,
	remainderColor: string,
) {
	let cursor = 0;
	const segments = items.map((item, index) => {
		const ratio = total > 0 ? item.value / total : 0;
		const start = cursor * 360;
		const end = (cursor + ratio) * 360;
		cursor += ratio;
		const color = item.color ?? Object.values(colorPalette.chart)[index % 6];
		return `${color} ${start}deg ${end}deg`;
	});
	if (cursor < 1) {
		const start = cursor * 360;
		segments.push(`${remainderColor} ${start}deg 360deg`);
	}
	if (segments.length === 0) {
		return colorPalette.slate[100];
	}
	return `conic-gradient(${segments.join(", ")})`;
}

export function UserSummaryPieChart({
	title,
	items,
	total,
	emptyMessage = "No data available.",
}: UserSummaryPieChartProps) {
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

	const gradient = buildGradient(items, base, colorPalette.slate[100]);

	return (
		<Card className="h-full">
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-semibold">{title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-col items-center gap-6 lg:flex-row lg:flex-wrap lg:justify-center">
					<div
						className="relative h-52 w-52 shrink-0 rounded-full shadow-lg"
						style={{ background: gradient }}
						aria-label={`${title} pie chart`}
					>
						<div className="absolute inset-6 rounded-full bg-background shadow-inner" />
						<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
							<span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
								Total
							</span>
							<span className="text-2xl font-semibold text-foreground">
								{base.toLocaleString()}
							</span>
						</div>
					</div>
					<div className="w-full max-w-[280px] space-y-2 lg:w-[260px] lg:max-w-none">
						{items.map((item, index) => {
							const ratio = base > 0 ? item.value / base : 0;
							const color =
								item.color ?? Object.values(colorPalette.chart)[index % 6];
							return (
								<div
									key={`${title}-legend-${item.label}`}
									className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-white/80 px-3 py-2 text-xs text-muted-foreground shadow-sm"
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
				</div>
			</CardContent>
		</Card>
	);
}
