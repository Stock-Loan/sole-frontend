import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	AclAssignment,
	AclAssignmentCreatePayload,
	AclAssignmentUpdatePayload,
	AclAssignmentsResponse,
} from "@/entities/acl/types";

export async function listAclAssignments(): Promise<AclAssignmentsResponse> {
	const { data } = await apiClient.get<AclAssignmentsResponse>("/acls/assignments");
	return unwrapApiResponse<AclAssignmentsResponse>(data);
}

export async function createAclAssignment(
	payload: AclAssignmentCreatePayload,
): Promise<AclAssignment> {
	const { data } = await apiClient.post<AclAssignment>(
		"/acls/assignments",
		payload,
	);
	return unwrapApiResponse<AclAssignment>(data);
}

export async function updateAclAssignment(
	assignmentId: string,
	payload: AclAssignmentUpdatePayload,
): Promise<AclAssignment> {
	const { data } = await apiClient.patch<AclAssignment>(
		`/acls/assignments/${assignmentId}`,
		payload,
	);
	return unwrapApiResponse<AclAssignment>(data);
}

export async function deleteAclAssignment(assignmentId: string): Promise<void> {
	await apiClient.delete(`/acls/assignments/${assignmentId}`);
}
