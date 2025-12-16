import { apiClient } from "@/lib/apiClient";
import type {
	Department,
	DepartmentAssignPayload,
	DepartmentInput,
	DepartmentListParams,
	DepartmentListResponse,
	DepartmentAssignResponse,
	DepartmentMembersResponse,
} from "../types";

export async function listDepartments(
	params: DepartmentListParams = {},
): Promise<DepartmentListResponse> {
	const { data } = await apiClient.get<DepartmentListResponse>("/departments", {
		params,
	});
	return data;
}

export async function createDepartment(payload: DepartmentInput): Promise<Department> {
	const { data } = await apiClient.post<Department>("/departments", payload);
	return data;
}

export async function updateDepartment(
	departmentId: string,
	payload: DepartmentInput,
): Promise<Department> {
	const { data } = await apiClient.patch<Department>(
		`/departments/${departmentId}`,
		payload,
	);
	return data;
}

export async function archiveDepartment(departmentId: string): Promise<Department> {
	const { data } = await apiClient.patch<Department>(`/departments/${departmentId}`, {
		is_archived: true,
	});
	return data;
}

export async function assignDepartmentToUsers(
	departmentId: string,
	membershipIds: string[],
): Promise<DepartmentAssignResponse> {
	const payload: DepartmentAssignPayload = { membership_ids: membershipIds };
	const { data } = await apiClient.post<DepartmentAssignResponse>(
		`/departments/${departmentId}/assign`,
		payload,
	);
	return data;
}

export async function unassignDepartments(membershipIds: string[]): Promise<void> {
	const payload: DepartmentAssignPayload = { membership_ids: membershipIds };
	await apiClient.post("/departments/unassign", payload);
}

export async function listDepartmentMembers(
	departmentId: string,
	params: { page?: number; page_size?: number } = {},
): Promise<DepartmentMembersResponse> {
	const { data } = await apiClient.get<DepartmentMembersResponse>(
		`/departments/${departmentId}/members`,
		{ params }
	);
	return data;
}
