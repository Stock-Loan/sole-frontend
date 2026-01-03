import { apiClient } from "@/lib/apiClient";
import { unwrapApiResponse } from "@/lib/api-response";
import type {
	StockDashboardSummary,
	StockDashboardSummaryParams,
} from "../types";

export async function getStockDashboardSummary(
	params: StockDashboardSummaryParams = {}
): Promise<StockDashboardSummary> {
	const { data } = await apiClient.get<StockDashboardSummary>(
		"/org/dashboard/stock-summary",
		{ params }
	);
	return unwrapApiResponse<StockDashboardSummary>(data);
}
