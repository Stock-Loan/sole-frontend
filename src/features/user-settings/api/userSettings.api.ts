import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type { UserSettingsProfile } from "../types";

export async function getUserSettings(): Promise<UserSettingsProfile> {
	const { data } = await apiClient.get<UserSettingsProfile>("/auth/me");
	return unwrapApiResponse<UserSettingsProfile>(data);
}
