import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { orgKeys } from "@/shared/api/queryKeys";
import { listOrgAuditLogs } from "./api";
import type { AuditLogListParams, AuditLogListResponse } from "./types";

export function useOrgAuditLogs(
	params: AuditLogListParams,
	options: Omit<
		UseQueryOptions<AuditLogListResponse, unknown>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: orgKeys.audit.logs.list(params),
		queryFn: () => listOrgAuditLogs(params),
		...options,
	});
}
