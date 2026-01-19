import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { meKeys } from "@/shared/api/queryKeys";
import { getMeDashboardSummary } from "./api";
import type { MeDashboardSummary, MeDashboardSummaryParams } from "./types";

export function useMeDashboardSummary(
	params: MeDashboardSummaryParams = {},
	options: Omit<
		UseQueryOptions<MeDashboardSummary>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: meKeys.dashboard.summary(params),
		queryFn: () => getMeDashboardSummary(params),
		placeholderData: (previous) => previous,
		...options,
	});
}
