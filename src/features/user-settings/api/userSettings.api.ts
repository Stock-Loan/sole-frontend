import { apiClient } from "@/lib/apiClient";
import type { UserSettingsProfile } from "../types";

export async function getUserSettings(): Promise<UserSettingsProfile> {
	const { data } = await apiClient.get<UserSettingsProfile>("/auth/me");
	return data;
}
