import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/entities/user/keys";
import { getOrgUserDisplayName } from "@/entities/user/constants";
import {
	listOrgUsers,
	getOrgUser,
	onboardOrgUser,
	updateOrgUserStatus,
	updateOrgUserProfile,
	bulkDeleteOrgUsers,
	deleteOrgUser,
	downloadOnboardingTemplate,
	uploadOnboardingCsv,
	getOrgUserSummary,
	forcePasswordReset,
} from "./api";
import type {
	OrgUserListItem,
	OrgUsersListParams,
	OrgUsersListResponse,
	UpdateOrgUserStatusPayload,
	UpdateOrgUserProfilePayload,
	UpdateOrgUserProfileWithStatusPayload,
	BulkOnboardingResult,
	UserDashboardSummary,
} from "./types";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";

export function useOrgUsersList(params: OrgUsersListParams) {
	return useQuery({
		queryKey: userKeys.list(params),
		queryFn: () => listOrgUsers(params),
		placeholderData: (previousData) => previousData,
	});
}

export function useOrgUserSummary(enabled = true) {
	return useQuery<UserDashboardSummary>({
		queryKey: userKeys.summary(),
		queryFn: () => getOrgUserSummary(),
		enabled,
		placeholderData: (previous) => previous,
	});
}

export function useOrgUsersSearch(
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
		enabled: enabled && Boolean(searchTerm),
		queryKey: userKeys.search(
			{ search: searchTerm, page: 1, page_size: pageSize },
			fullTerm,
		),
		queryFn: async () => {
			if (!searchTerm) {
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
					lastResponse = await listOrgUsers({
						search: term,
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

					if (normalizedFull.length > 0 && items.some(matchesFullTerm)) {
						break;
					}
					if (
						items.length >= total ||
						(lastResponse.items ?? []).length === 0
					) {
						break;
					}
					page += 1;
				}

				return {
					...(lastResponse ?? { items: [], total: 0 }),
					items,
					total,
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
		placeholderData: (previousData) => previousData,
	});
}

export function useOrgUserDetail(membershipId: string | null) {
	return useQuery({
		queryKey: userKeys.detail(membershipId ?? ""),
		queryFn: () => getOrgUser(membershipId!),
		enabled: !!membershipId,
	});
}

export function useOrgUserByEmail(email: string, enabled = true) {
	return useQuery({
		queryKey: userKeys.currentUser(email),
		queryFn: async () => {
			const response = await listOrgUsers({
				search: email,
				page: 1,
				page_size: 5,
			});
			return response.items?.find((item) => item.user.email === email) ?? null;
		},
		enabled: Boolean(email) && enabled,
		staleTime: 5 * 60 * 1000,
	});
}

export function useOnboardUser() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: onboardOrgUser,
		onSuccess: (result) => {
			if (result.membership_status === "already_exists") {
				toast({
					title: "User already onboarded",
					description: "This user is already a member of the organization.",
				});
			} else if (result.user_status === "existing") {
				toast({
					title: "Existing user found",
					description:
						"An existing user record was found in this organization and has been reused.",
				});
			} else {
				toast({
					title: "User onboarded",
					description: "The user has been onboarded into this organization.",
				});
			}
			// Invalidate the list to show the new user
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Failed to onboard user",
				description: apiError.message,
			});
		},
	});
}

export function useDownloadOnboardingTemplate() {
	return useMutation({
		mutationFn: downloadOnboardingTemplate,
	});
}

export function useUploadOnboardingCsv() {
	const queryClient = useQueryClient();

	return useMutation<BulkOnboardingResult, unknown, File>({
		mutationFn: uploadOnboardingCsv,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
		},
	});
}

export function useUpdateOrgUserStatus(membershipId: string) {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: (payload: UpdateOrgUserStatusPayload) =>
			updateOrgUserStatus(membershipId, payload),
		onSuccess: () => {
			toast({
				title: "User status updated",
				description: "The user's status has been successfully updated.",
			});
			queryClient.invalidateQueries({
				queryKey: userKeys.detail(membershipId),
			});
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Failed to update status",
				description: apiError.message,
			});
		},
	});
}

export function useUpdateOrgUserProfile(membershipId: string) {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: (payload: UpdateOrgUserProfilePayload) =>
			updateOrgUserProfile(membershipId, payload),
		onSuccess: () => {
			toast({
				title: "Profile updated",
				description: "The user's profile has been successfully updated.",
			});
			queryClient.invalidateQueries({
				queryKey: userKeys.detail(membershipId),
			});
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Failed to update profile",
				description: apiError.message,
			});
		},
	});
}

export function useUpdateOrgUserProfileWithStatus(membershipId: string | null) {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (payload: UpdateOrgUserProfileWithStatusPayload) => {
			if (!membershipId) return;
			const profilePayload = payload.profilePayload ?? null;
			const statusPayload = payload.statusPayload ?? null;
			if (profilePayload && Object.keys(profilePayload).length > 0) {
				await updateOrgUserProfile(membershipId, profilePayload);
			}
			if (statusPayload && Object.keys(statusPayload).length > 0) {
				await updateOrgUserStatus(membershipId, statusPayload);
			}
		},
		onSuccess: () => {
			toast({
				title: "User updated",
				description: "The user's updates have been successfully saved.",
			});
			queryClient.invalidateQueries({
				queryKey: userKeys.detail(membershipId ?? ""),
			});
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Update failed",
				description:
					apiError.message ||
					"We could not save profile changes. Please try again.",
			});
		},
	});
}

export function useDeleteOrgUser() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: deleteOrgUser,
		onSuccess: () => {
			toast({
				title: "User removed",
				description: "The user has been removed from the organization.",
			});
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Failed to remove user",
				description: apiError.message,
			});
		},
	});
}

export function useBulkDeleteOrgUsers() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: bulkDeleteOrgUsers,
		onSuccess: (response) => {
			const deletedUsers = response.deleted ?? 0;
			const notFound = response.not_found ?? [];
			toast({
				title: "Users removed",
				description: `${deletedUsers} users deleted${
					notFound.length ? ` • Not found: ${notFound.join(", ")}` : ""
				}.`,
			});
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Failed to delete users",
				description: apiError.message,
			});
		},
	});
}

export function useForcePasswordReset() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: forcePasswordReset,
		onSuccess: () => {
			toast({
				title: "Password reset required",
				description:
					"The user will be prompted to change their password on next login.",
			});
			queryClient.invalidateQueries({ queryKey: userKeys.list() });
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			toast({
				variant: "destructive",
				title: "Password reset failed",
				description: apiError.message,
			});
		},
	});
}
