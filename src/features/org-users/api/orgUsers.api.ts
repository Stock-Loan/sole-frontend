import { apiClient } from "@/lib/apiClient";
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
} from "../types";
import {
	OrgUsersListResponseSchema,
	OrgUserListItemSchema,
	OnboardUserResponseSchema,
	BulkOnboardingResultSchema,
	BulkDeleteMembershipsResponseSchema,
} from "../schemas";

export async function listOrgUsers(
	params: OrgUsersListParams = {},
): Promise<OrgUsersListResponse> {
	const response = await apiClient.get<OrgUsersListResponse>("/org/users", {
		params,
	});
	return OrgUsersListResponseSchema.parse(response.data);
}

export async function getOrgUser(membershipId: string): Promise<OrgUserListItem> {
	const response = await apiClient.get<OrgUserListItem>(`/org/users/${membershipId}`);
	return OrgUserListItemSchema.parse(response.data);
}

export async function updateOrgUserStatus(
	membershipId: string,
	payload: UpdateOrgUserStatusPayload,
): Promise<OrgUserListItem> {
	const response = await apiClient.patch<OrgUserListItem>(
		`/org/users/${membershipId}`,
		payload,
	);
	return OrgUserListItemSchema.parse(response.data);
}

export async function updateOrgUserProfile(
	membershipId: string,
	payload: UpdateOrgUserProfilePayload,
): Promise<OrgUserListItem> {
	const response = await apiClient.patch<OrgUserListItem>(
		`/org/users/${membershipId}/profile`,
		payload,
	);
	return OrgUserListItemSchema.parse(response.data);
}

export async function onboardOrgUser(
	payload: OnboardUserPayload,
): Promise<OnboardUserResponse> {
	const response = await apiClient.post<OnboardUserResponse>("/org/users", payload);
	return OnboardUserResponseSchema.parse(response.data);
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
	return BulkOnboardingResultSchema.parse(response.data);
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
	return BulkDeleteMembershipsResponseSchema.parse(data);
}
