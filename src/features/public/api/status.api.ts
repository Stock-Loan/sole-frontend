import { apiClient } from "@/lib/apiClient";
import { unwrapApiResponse } from "@/lib/api-response";
import type { StatusSummary } from "../types";

export async function getStatusSummary() {
	const { data } = await apiClient.get<StatusSummary>("/status/summary");
	return unwrapApiResponse<StatusSummary>(data);
}
