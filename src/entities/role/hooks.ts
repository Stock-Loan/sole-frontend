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
	getRoleMembers,
	invalidateOrgPermissions,
} from "./api";
import type {
	InvalidatePermissionsResponse,
	Role,
	RoleInput,
	RoleListParams,
	RoleListResponse,
} from "./types";
import type {
	OrgUserListItem,
	OrgUsersListResponse,
	OrgUsersListParams,
} from "@/entities/user/types";
import { getOrgUserDisplayName } from "@/entities/user/constants";

export function useRolesList(
	params: RoleListParams = {},
	options: Omit<UseQueryOptions<RoleListResponse>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: roleKeys.list(params),
		queryFn: () => listRoles(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useRoleMembersSearch(
	roleId: string | null,
	searchTerm: string,
	fullTerm: string,
	options: {
		enabled?: boolean;
		pageSize?: number;
		maxPages?: number;
		staleTime?: number;
	} = {},
) {
	const {
		enabled = true,
		pageSize = 25,
		maxPages = 4,
		staleTime = 30 * 1000,
	} = options;

	return useQuery<OrgUsersListResponse>({
		enabled: enabled && Boolean(roleId) && Boolean(searchTerm),
		queryKey: roleKeys.members(
			roleId ?? "unknown",
			{ page: 1, page_size: pageSize },
		),
		queryFn: async () => {
			if (!roleId || !searchTerm) {
				return { items: [], total: 0 };
			}
			const normalizedFull = fullTerm.trim().toLowerCase();
			const matchesFullTerm = (user: OrgUserListItem) => {
				const name = getOrgUserDisplayName(user.user).toLowerCase();
				const email = user.user.email?.toLowerCase() ?? "";
				const employeeId = user.membership.employee_id?.toLowerCase() ?? "";
				return (
					name.includes(normalizedFull) ||
					email.includes(normalizedFull) ||
					employeeId.includes(normalizedFull)
				);
			};

			const runSearch = async (term: string) => {
				let page = 1;
				let total = 0;
				let lastResponse: OrgUsersListResponse | null = null;
				const items: OrgUserListItem[] = [];
				const seen = new Set<string>();

				while (page <= maxPages) {
					lastResponse = await getRoleMembers(roleId, {
						page,
						page_size: pageSize,
					});
					(lastResponse.items ?? []).forEach((user) => {
						const key = user.membership.id;
						if (seen.has(key)) return;
						seen.add(key);
						items.push(user);
					});
					total = lastResponse.total ?? items.length;

					if (items.length >= total || (lastResponse.items ?? []).length === 0) {
						break;
					}
					page += 1;
				}

				const filteredItems =
					term.trim().length > 0
						? items.filter(matchesFullTerm)
						: items;
				return {
					...(lastResponse ?? { items: [], total: 0 }),
					items: filteredItems,
					total: filteredItems.length,
				};
			};

			const initial = await runSearch(searchTerm);
			if (initial.items?.length) return initial;
			const lower = searchTerm.toLowerCase();
			if (lower !== searchTerm) {
				return runSearch(lower);
			}
			return initial;
		},
		staleTime,
	});
}

export function useRoleMembersList(
	roleId: string | null,
	params: OrgUsersListParams = {},
	options: Omit<
		UseQueryOptions<OrgUsersListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	const { enabled = true } = options;
	return useQuery({
		enabled: enabled && Boolean(roleId),
		queryKey: roleKeys.members(roleId ?? "unknown", params),
		queryFn: () => getRoleMembers(roleId ?? "", params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useRoleMemberLookup(
	roleId: string | null,
	userId: string | null,
	options: {
		enabled?: boolean;
		pageSize?: number;
		maxPages?: number;
		staleTime?: number;
	} = {}
) {
	const {
		enabled = true,
		pageSize = 200,
		maxPages = 10,
		staleTime = 30 * 1000,
	} = options;

	return useQuery<OrgUserListItem | null>({
		enabled: enabled && Boolean(roleId) && Boolean(userId),
		queryKey: roleKeys.memberLookup(roleId ?? "unknown", userId ?? "unknown"),
		queryFn: async () => {
			if (!roleId || !userId) return null;
			let page = 1;
			let lastResponse: OrgUsersListResponse | null = null;

			while (page <= maxPages) {
				lastResponse = await getRoleMembers(roleId, {
					page,
					page_size: pageSize,
				});
				const match = lastResponse.items?.find(
					(item) => item.user.id === userId
				);
				if (match) return match;

				const total = lastResponse.total ?? lastResponse.items.length;
				if (
					lastResponse.items.length === 0 ||
					page * pageSize >= total
				) {
					break;
				}
				page += 1;
			}

			return null;
		},
		staleTime,
	});
}

export function useCreateRole(
	options: Omit<UseMutationOptions<Role, unknown, RoleInput>, "mutationFn"> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createRole,
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.list() });
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({ queryKey: roleKeys.list() });
			queryClient.invalidateQueries({ queryKey: roleKeys.detail(data.id) });
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
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
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({
				queryKey: roleKeys.forUser(membershipId),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useUpdateUserRoles(
	options: Omit<
		UseMutationOptions<
			void,
			unknown,
			{ membershipId: string; addRoleIds: string[]; removeRoleIds: string[] }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({ membershipId, addRoleIds, removeRoleIds }) => {
			if (addRoleIds.length > 0) {
				await assignRolesToUser(membershipId, addRoleIds);
			}
			if (removeRoleIds.length > 0) {
				await removeRolesFromUser(membershipId, removeRoleIds);
			}
		},
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({
				queryKey: roleKeys.forUser(variables.membershipId),
			});
			// Also invalidate user list as roles are shown there
			queryClient.invalidateQueries({ queryKey: ["org-users"] }); // Need to check actual key
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useInvalidateOrgPermissions(
	options: Omit<
		UseMutationOptions<InvalidatePermissionsResponse, unknown, void>,
		"mutationFn"
	> = {}
) {
	return useMutation({
		mutationFn: () => invalidateOrgPermissions(),
		...options,
	});
}
