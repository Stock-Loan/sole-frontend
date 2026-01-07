import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { roleKeys } from "@/entities/role/keys";
import {
	assignRolesToUser,
	createRole,
	listRoles,
	removeRolesFromUser,
	updateRole,
} from "./api";
import type { Role, RoleInput, RoleListParams, RoleListResponse } from "./types";

export function useRolesList(
	params: RoleListParams = {},
	options: Omit<
		UseQueryOptions<RoleListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: roleKeys.list(params),
		queryFn: () => listRoles(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useCreateRole(
	options: Omit<
		UseMutationOptions<Role, unknown, RoleInput>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createRole,
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.list() });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useUpdateRole(
	options: Omit<
		UseMutationOptions<Role, unknown, { id: string; payload: RoleInput }>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }) => updateRole(id, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.list() });
			queryClient.invalidateQueries({ queryKey: roleKeys.detail(data.id) });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useAssignRolesToUser(
	membershipId: string,
	options: Omit<
		UseMutationOptions<Role[], unknown, string[]>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (roleIds) => assignRolesToUser(membershipId, roleIds),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.forUser(membershipId) });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}

export function useRemoveRolesFromUser(
	membershipId: string,
	options: Omit<
		UseMutationOptions<void, unknown, string[]>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (roleIds) => removeRolesFromUser(membershipId, roleIds),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.forUser(membershipId) });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}
