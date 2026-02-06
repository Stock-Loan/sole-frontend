import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type { UserSettingsProfile } from "../types";
import type { UpdateSelfProfilePayload } from "@/entities/user/types";

export async function getUserSettings(): Promise<UserSettingsProfile> {
	const { data } = await apiClient.get<UserSettingsProfile>("/self/profile");
	return unwrapApiResponse<UserSettingsProfile>(data);
}

export async function updateSelfProfile(
	payload: UpdateSelfProfilePayload
): Promise<UserSettingsProfile> {
	const { data } = await apiClient.patch<UserSettingsProfile>(
		"/self/profile",
		payload
	);
	return unwrapApiResponse<UserSettingsProfile>(data);
}
