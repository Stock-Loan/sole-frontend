import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	Role,
	RoleInput,
	RoleListParams,
	RoleListResponse,
} from "./types";

export async function listRoles(
	params: RoleListParams = {}
): Promise<RoleListResponse> {
	const { data } = await apiClient.get<RoleListResponse>("/roles", { params });
	return unwrapApiResponse<RoleListResponse>(data);
}

export async function createRole(payload: RoleInput): Promise<Role> {
	const { data } = await apiClient.post<Role>("/roles", payload);
	return unwrapApiResponse<Role>(data);
}

export async function updateRole(
	roleId: string,
	payload: RoleInput
): Promise<Role> {
	const { data } = await apiClient.patch<Role>(`/roles/${roleId}`, payload);
	return unwrapApiResponse<Role>(data);
}

export async function deleteRole(roleId: string): Promise<void> {
	await apiClient.delete(`/roles/${roleId}`);
}

export async function assignRolesToUser(
	membershipId: string,
	roleIds: string[]
): Promise<Role[]> {
	const { data } = await apiClient.post<Role[]>(
		`/roles/org/users/${membershipId}/roles`,
		{ role_ids: roleIds }
	);
	return unwrapApiResponse<Role[]>(data);
}

export async function removeRolesFromUser(
	membershipId: string,
	roleIds: string[]
): Promise<void> {
	await apiClient.delete(`/roles/org/users/${membershipId}/roles`, {
		data: { role_ids: roleIds },
	});
}
