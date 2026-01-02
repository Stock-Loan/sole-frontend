import { apiClient } from "@/lib/apiClient";
import { unwrapApiResponse } from "@/lib/api-response";
import type { UserSettingsProfile } from "../types";

export async function getUserSettings(): Promise<UserSettingsProfile> {
	const { data } = await apiClient.get<UserSettingsProfile>("/auth/me");
	return unwrapApiResponse<UserSettingsProfile>(data);
}
