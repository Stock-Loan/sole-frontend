import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AnnouncementListParams } from "@/entities/announcement/types";
import { announcementKeys } from "@/entities/announcement/keys";
import {
	getUnreadNotificationCount,
	listNotifications,
	listUnreadNotifications,
	markNotificationRead,
} from "./notificationApi";

const defaultRecentParams: AnnouncementListParams = {
	status: "PUBLISHED",
	page: 1,
	page_size: 10,
};

export function useUnreadNotifications(enabled: boolean) {
	return useQuery({
		queryKey: announcementKeys.unread(),
		queryFn: listUnreadNotifications,
		enabled,
		staleTime: 30 * 1000,
	});
}

export function useUnreadNotificationCount(enabled: boolean) {
	return useQuery({
		queryKey: announcementKeys.unreadCount(),
		queryFn: getUnreadNotificationCount,
		enabled,
		staleTime: 30 * 1000,
	});
}

export function useRecentNotifications(
	enabled: boolean,
	params: AnnouncementListParams = defaultRecentParams
) {
	return useQuery({
		queryKey: announcementKeys.list(params),
		queryFn: () => listNotifications(params),
		enabled,
		staleTime: 30 * 1000,
	});
}

export function useMarkNotificationRead() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: markNotificationRead,
		onSuccess: () => {
			queryClient.invalidateQueries({
			queryKey: announcementKeys.unread(),
			});
			queryClient.invalidateQueries({
			queryKey: announcementKeys.unreadCount(),
			});
		},
	});
}
