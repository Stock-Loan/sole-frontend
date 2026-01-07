import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { dashboardKeys } from "./keys";
import { getStockDashboardSummary } from "./api/dashboard.api";
import type { StockDashboardSummary, StockDashboardSummaryParams } from "./types";

export function useStockDashboardSummary(
	params: StockDashboardSummaryParams = {},
	options: Omit<UseQueryOptions<StockDashboardSummary>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: dashboardKeys.stockSummary(params),
		queryFn: () => getStockDashboardSummary(params),
		placeholderData: (previous) => previous,
		...options,
	});
}
