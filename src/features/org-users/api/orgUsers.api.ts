import { apiClient } from "@/lib/apiClient";
import type {
	OrgUserDetail,
	OrgUsersListParams,
	OrgUsersListResponse,
	OnboardUserPayload,
	OnboardUserResponse,
	BulkOnboardingResult,
	UpdateOrgUserStatusPayload,
} from "../types";

// Endpoint references live in docs/backend-endpoints.md. Org user endpoints below mirror that contract.

export async function listOrgUsers(
	params: OrgUsersListParams = {},
): Promise<OrgUsersListResponse> {
	const response = await apiClient.get<OrgUsersListResponse>("/org/users", {
		params,
	});
	return response.data;
}

export async function getOrgUser(membershipId: string): Promise<OrgUserDetail> {
	const response = await apiClient.get<OrgUserDetail>(
		`/org/users/${membershipId}`,
	);
	return response.data;
}

export async function updateOrgUserStatus(
	membershipId: string,
	payload: UpdateOrgUserStatusPayload,
): Promise<OrgUserDetail> {
	const response = await apiClient.patch<OrgUserDetail>(
		`/org/users/${membershipId}/status`,
		payload,
	);
	return response.data;
}

export async function onboardOrgUser(
	payload: OnboardUserPayload,
): Promise<OnboardUserResponse> {
	const response = await apiClient.post<OnboardUserResponse>("/org/users", payload);
	return response.data;
}

export async function downloadOnboardingTemplate(): Promise<Blob> {
	const response = await apiClient.get<Blob>("/org/users/bulk/template", {
		responseType: "blob",
	});
	return response.data;
}

export async function uploadOnboardingCsv(file: File): Promise<BulkOnboardingResult> {
	const formData = new FormData();
	formData.append("file", file);
	const response = await apiClient.post<BulkOnboardingResult>("/org/users/bulk", formData, {
		headers: {
			"Content-Type": "multipart/form-data",
		},
	});
	return response.data;
}
