import { apiClient } from "@/lib/apiClient";
import { unwrapApiResponse } from "@/lib/api-response";
import type { OrgSettings, OrgSettingsUpdatePayload } from "../types";

export async function getOrgSettings(): Promise<OrgSettings> {
	const { data } = await apiClient.get<OrgSettings>("/org/settings");
	return unwrapApiResponse<OrgSettings>(data);
}

export async function updateOrgSettings(
	payload: OrgSettingsUpdatePayload
): Promise<OrgSettings> {
	const { data } = await apiClient.put<OrgSettings>("/org/settings", payload);
	return unwrapApiResponse<OrgSettings>(data);
}
