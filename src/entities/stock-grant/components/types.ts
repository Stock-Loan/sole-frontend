import type { StockSummaryMetric } from "@/entities/stock-grant/types";

export interface StockSummaryMetricGridProps {
	metrics: StockSummaryMetric[];
}

export interface StockSummaryDonutItem {
	label: string;
	value: number;
	color?: string;
}

export interface StockSummaryDonutCardProps {
	title: string;
	items: StockSummaryDonutItem[];
	total?: number;
	emptyMessage?: string;
}

export interface StockSummaryStackedItem {
	label: string;
	value: number;
	color?: string;
}

export interface StockSummaryStackedBarCardProps {
	title: string;
	items: StockSummaryStackedItem[];
	total?: number;
	emptyMessage?: string;
}

export interface StockSummaryGaugeCardProps {
	title: string;
	value: number;
	helper?: string;
	color?: string;
}

export interface StockSummaryTimelineEvent {
	vest_date: string;
	shares: number;
}

export interface StockSummaryTimelineCardProps {
	title: string;
	events: StockSummaryTimelineEvent[];
	emptyMessage?: string;
}
