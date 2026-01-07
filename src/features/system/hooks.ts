import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { getStatusSummary } from "@/features/system/api";
import type { StatusSummary } from "@/features/system/types";

export function useStatusSummary(
	options: Omit<UseQueryOptions<StatusSummary>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: ["status", "summary"],
		queryFn: getStatusSummary,
		staleTime: 0,
		...options,
	});
}
