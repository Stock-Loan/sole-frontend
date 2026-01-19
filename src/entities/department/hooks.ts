import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { departmentKeys } from "@/entities/department/keys";
import {
	archiveDepartment,
	assignDepartmentToUsers,
	createDepartment,
	listDepartments,
	unassignDepartments,
	updateDepartment,
} from "./api";
import type {
	Department,
	DepartmentInput,
	DepartmentListParams,
	DepartmentListResponse,
	DepartmentAssignResponse,
} from "./types";
import { userKeys } from "@/entities/user/keys";

export function useDepartmentsList(
	params: DepartmentListParams = {},
	options: Omit<
		UseQueryOptions<DepartmentListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: departmentKeys.list(params),
		queryFn: () => listDepartments(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useCreateDepartment(
	options: Omit<
		UseMutationOptions<Department, unknown, DepartmentInput>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createDepartment,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useUpdateDepartment(
	options: Omit<
		UseMutationOptions<Department, unknown, { id: string; payload: DepartmentInput }>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }) => updateDepartment(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
			queryClient.invalidateQueries({ queryKey: departmentKeys.detail(data.id) });
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useArchiveDepartment(
	options: Omit<
		UseMutationOptions<Department, unknown, string>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (departmentId) => archiveDepartment(departmentId),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useAssignDepartmentToUsers(
	departmentId: string,
	options: Omit<
		UseMutationOptions<DepartmentAssignResponse, unknown, string[]>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (membershipIds) =>
			assignDepartmentToUsers(departmentId, membershipIds),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useAssignUsersToDepartment(
	options: Omit<
		UseMutationOptions<
			DepartmentAssignResponse,
			unknown,
			{ departmentId: string; membershipIds: string[] }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ departmentId, membershipIds }) =>
			assignDepartmentToUsers(departmentId, membershipIds),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
			queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useUnassignDepartments(
	options: Omit<
		UseMutationOptions<void, unknown, string[]>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (membershipIds) => unassignDepartments(membershipIds),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useUpdateUserDepartment(
	membershipId: string,
	options: Omit<
		UseMutationOptions<DepartmentAssignResponse | void, unknown, string | null>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (departmentId) => {
			if (departmentId) {
				return assignDepartmentToUsers(departmentId, [membershipId]);
			}
			return unassignDepartments([membershipId]);
		},
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: departmentKeys.list() });
			queryClient.invalidateQueries({ queryKey: userKeys.detail(membershipId) });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}
