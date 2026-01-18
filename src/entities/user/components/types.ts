export interface UserSummaryMetric {
	label: string;
	value: string;
	helper?: string;
}

export interface UserSummaryMetricGridProps {
	metrics: UserSummaryMetric[];
}

export interface UserSummaryPieItem {
	label: string;
	value: number;
	color?: string;
}

export interface UserSummaryPieChartProps {
	title: string;
	items: UserSummaryPieItem[];
	total?: number;
	emptyMessage?: string;
}

export interface UserSummaryTrendItem {
	label: string;
	value: number;
	color?: string;
}

export interface UserSummaryTrendCardProps {
	title: string;
	items: UserSummaryTrendItem[];
	total?: number;
	emptyMessage?: string;
}
