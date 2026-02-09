import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	OrgUserListItem,
	OrgUsersListParams,
	OrgUsersListResponse,
	OnboardUserPayload,
	OnboardUserResponse,
	BulkOnboardingResult,
	UpdateOrgUserStatusPayload,
	UpdateOrgUserProfilePayload,
	BulkDeleteMembershipsResponse,
	UserDashboardSummary,
} from "./types";
import {
	OrgUsersListResponseSchema,
	OrgUserListItemSchema,
	OnboardUserResponseSchema,
	BulkOnboardingResultSchema,
	BulkDeleteMembershipsResponseSchema,
} from "./schemas";

export async function listOrgUsers(
	params: OrgUsersListParams = {},
): Promise<OrgUsersListResponse> {
	const response = await apiClient.get<OrgUsersListResponse>("/org/users", {
		params,
	});
	const payload = unwrapApiResponse<OrgUsersListResponse>(response.data);
	return OrgUsersListResponseSchema.parse(payload);
}

export async function getOrgUser(
	membershipId: string,
): Promise<OrgUserListItem> {
	const response = await apiClient.get<OrgUserListItem>(
		`/org/users/${membershipId}`,
	);
	const payload = unwrapApiResponse<OrgUserListItem>(response.data);
	return OrgUserListItemSchema.parse(payload);
}

export async function updateOrgUserStatus(
	membershipId: string,
	payload: UpdateOrgUserStatusPayload,
): Promise<OrgUserListItem> {
	const response = await apiClient.patch<OrgUserListItem>(
		`/org/users/${membershipId}`,
		payload,
	);
	const payloadResponse = unwrapApiResponse<OrgUserListItem>(response.data);
	return OrgUserListItemSchema.parse(payloadResponse);
}

export async function updateOrgUserProfile(
	membershipId: string,
	payload: UpdateOrgUserProfilePayload,
): Promise<OrgUserListItem> {
	const response = await apiClient.patch<OrgUserListItem>(
		`/org/users/${membershipId}/profile`,
		payload,
	);
	const payloadResponse = unwrapApiResponse<OrgUserListItem>(response.data);
	return OrgUserListItemSchema.parse(payloadResponse);
}

export async function onboardOrgUser(
	payload: OnboardUserPayload,
): Promise<OnboardUserResponse> {
	const response = await apiClient.post<OnboardUserResponse>(
		"/org/users",
		payload,
	);
	const payloadResponse = unwrapApiResponse<OnboardUserResponse>(response.data);
	return OnboardUserResponseSchema.parse(payloadResponse);
}

export async function downloadOnboardingTemplate(): Promise<Blob> {
	const response = await apiClient.get<Blob>("/org/users/bulk/template", {
		responseType: "blob",
	});
	return response.data;
}

export async function uploadOnboardingCsv(
	file: File,
): Promise<BulkOnboardingResult> {
	const formData = new FormData();
	formData.append("file", file);
	const response = await apiClient.post<BulkOnboardingResult>(
		"/org/users/bulk",
		formData,
		{
			headers: {
				"Content-Type": "multipart/form-data",
			},
		},
	);
	const payloadResponse = unwrapApiResponse<BulkOnboardingResult>(
		response.data,
	);
	return BulkOnboardingResultSchema.parse(payloadResponse);
}

export async function deleteOrgUser(membershipId: string): Promise<void> {
	await apiClient.delete(`/org/users/${membershipId}`);
}

export async function bulkDeleteOrgUsers(
	membershipIds: string[],
): Promise<BulkDeleteMembershipsResponse> {
	const { data } = await apiClient.post<BulkDeleteMembershipsResponse>(
		"/org/users/bulk/delete",
		{ membership_ids: membershipIds },
	);
	const payloadResponse =
		unwrapApiResponse<BulkDeleteMembershipsResponse>(data);
	return BulkDeleteMembershipsResponseSchema.parse(payloadResponse);
}

export async function getOrgUserSummary(): Promise<UserDashboardSummary> {
	const { data } = await apiClient.get<UserDashboardSummary>(
		"/org/dashboard/user-summary",
	);
	return unwrapApiResponse<UserDashboardSummary>(data);
}

export async function adminResetUserMfa(
	membershipId: string,
): Promise<{ message: string }> {
	const { data } = await apiClient.post<{ message: string }>(
		`/org/users/${membershipId}/mfa/reset`,
	);
	return unwrapApiResponse<{ message: string }>(data);
}

export async function forcePasswordReset(
	membershipId: string,
): Promise<{ message: string }> {
	const { data } = await apiClient.post<{ message: string }>(
		`/org/users/${membershipId}/force-password-reset`,
	);
	return unwrapApiResponse<{ message: string }>(data);
}
