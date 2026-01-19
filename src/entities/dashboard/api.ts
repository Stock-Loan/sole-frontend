import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type { MeDashboardSummary, MeDashboardSummaryParams } from "./types";

export async function getMeDashboardSummary(
	params: MeDashboardSummaryParams = {}
): Promise<MeDashboardSummary> {
	const { data } = await apiClient.get<MeDashboardSummary>(
		"/me/dashboard/summary",
		{
			params,
		}
	);
	return unwrapApiResponse<MeDashboardSummary>(data);
}
