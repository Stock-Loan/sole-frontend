import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { announcementKeys } from "@/entities/announcement/keys";
import {
	changeAnnouncementStatus,
	createAnnouncement,
	listAdminAnnouncements,
	listAnnouncements,
	updateAnnouncement,
} from "./api";
import type {
	Announcement,
	AnnouncementCreatePayload,
	AnnouncementListParams,
	AnnouncementListResponse,
	AnnouncementStatus,
	AnnouncementUpdatePayload,
} from "./types";

export function useAnnouncementsList(
	params: AnnouncementListParams = {},
	options: Omit<
		UseQueryOptions<AnnouncementListResponse>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: announcementKeys.list(params),
		queryFn: () => listAnnouncements(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useAdminAnnouncementsList(
	params: AnnouncementListParams = {},
	options: Omit<
		UseQueryOptions<AnnouncementListResponse>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: announcementKeys.adminList(params),
		queryFn: () => listAdminAnnouncements(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useCreateAnnouncement(
	options: Omit<
		UseMutationOptions<Announcement, unknown, AnnouncementCreatePayload>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: createAnnouncement,
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: ["announcements", "admin"],
			});
			void queryClient.invalidateQueries({
				queryKey: ["announcements", "list"],
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useUpdateAnnouncement(
	options: Omit<
		UseMutationOptions<
			Announcement,
			unknown,
			{ id: string; payload: AnnouncementUpdatePayload }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, payload }) => updateAnnouncement(id, payload),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: ["announcements", "admin"],
			});
			void queryClient.invalidateQueries({
				queryKey: ["announcements", "list"],
			});
			void queryClient.invalidateQueries({
				queryKey: announcementKeys.detail(data.id),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useChangeAnnouncementStatus(
	options: Omit<
		UseMutationOptions<
			Announcement,
			unknown,
			{ id: string; status: AnnouncementStatus }
		>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ id, status }) => changeAnnouncementStatus(id, status),
		onSuccess: (data, variables, onMutateResult, context) => {
			void queryClient.invalidateQueries({
				queryKey: ["announcements", "admin"],
			});
			void queryClient.invalidateQueries({
				queryKey: ["announcements", "list"],
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}
