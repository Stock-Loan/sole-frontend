import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type { AuditLogListParams, AuditLogListResponse } from "./types";

export async function listOrgAuditLogs(
	params: AuditLogListParams = {}
): Promise<AuditLogListResponse> {
	const { data } = await apiClient.get<AuditLogListResponse>("/org/audit-logs", {
		params,
	});
	return unwrapApiResponse<AuditLogListResponse>(data);
}
