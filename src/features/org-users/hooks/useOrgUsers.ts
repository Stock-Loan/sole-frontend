import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
	listOrgUsers,
	getOrgUser,
	onboardOrgUser,
	updateOrgUserStatus,
	updateOrgUserProfile,
	bulkDeleteOrgUsers,
	deleteOrgUser,
} from "../api/orgUsers.api";
import type {
	OrgUsersListParams,
	UpdateOrgUserStatusPayload,
	UpdateOrgUserProfilePayload,
} from "../types";
import { useToast } from "@/components/ui/use-toast";
import { parseApiError } from "@/lib/api-error";

export function useOrgUsersList(params: OrgUsersListParams) {
	return useQuery({
		queryKey: queryKeys.orgUsers.list(params),
		queryFn: () => listOrgUsers(params),
		placeholderData: (previousData) => previousData,
	});
}

export function useOrgUserDetail(membershipId: string | null) {
	return useQuery({
		queryKey: queryKeys.orgUsers.detail(membershipId ?? ""),
		queryFn: () => getOrgUser(membershipId!),
		enabled: !!membershipId,
	});
}

export function useOnboardUser() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: onboardOrgUser,
		onSuccess: () => {
			toast({
				title: "User onboarded",
				description: "The user has been added to this organization.",
			});
			// Invalidate the list to show the new user
			queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.list() });
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
				queryKey: queryKeys.orgUsers.detail(membershipId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.list() });
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
				queryKey: queryKeys.orgUsers.detail(membershipId),
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.list() });
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
			queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.list() });
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
			queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.list() });
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
