import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type { StatusSummary } from "./types";

export async function getStatusSummary() {
	const { data } = await apiClient.get<StatusSummary>("/status/summary");
	return unwrapApiResponse<StatusSummary>(data);
}
