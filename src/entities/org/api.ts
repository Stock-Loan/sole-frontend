import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	OrgCreatePayload,
	OrgRecord,
	OrgSettings,
	OrgSettingsUpdatePayload,
	PbgcMidTermRate,
	PbgcRateRefreshResponse,
	SelfOrgPolicy,
} from "./types";

export async function getOrgSettings(): Promise<OrgSettings> {
	const { data } = await apiClient.get<OrgSettings>("/org/settings");
	return unwrapApiResponse<OrgSettings>(data);
}

export async function updateOrgSettings(
	payload: OrgSettingsUpdatePayload,
): Promise<OrgSettings> {
	const { data } = await apiClient.put<OrgSettings>("/org/settings", payload);
	return unwrapApiResponse<OrgSettings>(data);
}

export async function getSelfOrgPolicy(): Promise<SelfOrgPolicy> {
	const { data } = await apiClient.get<SelfOrgPolicy>("/self/policy");
	return unwrapApiResponse<SelfOrgPolicy>(data);
}

export async function createOrg(payload: OrgCreatePayload): Promise<OrgRecord> {
	const { data } = await apiClient.post<OrgRecord>("/orgs", payload);
	return unwrapApiResponse<OrgRecord>(data);
}

export async function getPbgcRates(
	year?: number | null,
): Promise<PbgcMidTermRate[]> {
	const { data } = await apiClient.get<PbgcMidTermRate[]>(
		"/org/settings/pbgc-rates",
		{ params: year ? { year } : undefined },
	);
	return unwrapApiResponse<PbgcMidTermRate[]>(data);
}

export async function refreshPbgcRates(): Promise<PbgcRateRefreshResponse> {
	const { data } = await apiClient.post<PbgcRateRefreshResponse>(
		"/org/settings/pbgc-rates/refresh",
	);
	return unwrapApiResponse<PbgcRateRefreshResponse>(data);
}
