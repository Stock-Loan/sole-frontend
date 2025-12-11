import { apiClient } from "@/lib/apiClient";
import type { StatusSummary } from "../types";

export async function getStatusSummary() {
	const { data } = await apiClient.get<StatusSummary>("/status/summary");
	return data;
}
