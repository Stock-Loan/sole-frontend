import type { StockDashboardSummaryParams } from "./types";

export const dashboardKeys = {
	stockSummary: (params?: StockDashboardSummaryParams) =>
		["dashboard", "stock-summary", params ?? {}] as const,
};
