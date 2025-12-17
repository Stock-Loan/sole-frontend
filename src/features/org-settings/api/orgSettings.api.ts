import { apiClient } from "@/lib/apiClient";
import type { OrgSettings, OrgSettingsUpdatePayload } from "../types";

export async function getOrgSettings(): Promise<OrgSettings> {
	const { data } = await apiClient.get<OrgSettings>("/org/settings");
	return data;
}

export async function updateOrgSettings(
	payload: OrgSettingsUpdatePayload
): Promise<OrgSettings> {
	const { data } = await apiClient.put<OrgSettings>("/org/settings", payload);
	return data;
}
