import { apiClient } from "@/lib/apiClient";
import type { TimezoneId, TimezoneListResponse } from "../types";

export async function getTimezones(): Promise<TimezoneId[]> {
	const { data } = await apiClient.get<TimezoneListResponse>("/meta/timezones");
	if (data && Array.isArray(data.timezones)) {
		return data.timezones;
	}
	return [];
}
