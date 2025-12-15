import { apiClient } from "@/lib/apiClient";
import type {
	Role,
	RoleAssignmentPayload,
	RoleInput,
	RoleListResponse,
} from "../types";

export async function listRoles(): Promise<RoleListResponse> {
	const { data } = await apiClient.get<RoleListResponse>("/roles");
	return data;
}

export async function createRole(payload: RoleInput): Promise<Role> {
	const { data } = await apiClient.post<Role>("/roles", payload);
	return data;
}

export async function updateRole(roleId: string, payload: RoleInput): Promise<Role> {
	const { data } = await apiClient.patch<Role>(`/roles/${roleId}`, payload);
	return data;
}

export async function deleteRole(roleId: string): Promise<void> {
	await apiClient.delete(`/roles/${roleId}`);
}

export async function assignRoleToUser(
	membershipId: string,
	roleId: string,
): Promise<Role> {
	const payload: RoleAssignmentPayload = { role_id: roleId };
	const { data } = await apiClient.post<Role>(
		`/roles/org/users/${membershipId}/roles`,
		payload,
	);
	return data;
}

export async function removeRoleFromUser(
	membershipId: string,
	roleId: string,
): Promise<void> {
	await apiClient.delete(`/roles/org/users/${membershipId}/roles/${roleId}`);
}
