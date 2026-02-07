import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { AnnouncementListParams } from "@/entities/announcement/types";
import { announcementKeys } from "@/entities/announcement/keys";
import {
	getUnreadNotificationCount,
	listNotifications,
	listUnreadNotifications,
	markNotificationRead,
} from "./notificationApi";
import { useAuth } from "@/auth/hooks";
import { useTenant } from "@/features/tenancy/hooks";

const defaultRecentParams: AnnouncementListParams = {
	status: "PUBLISHED",
	page: 1,
	page_size: 10,
};

const MAX_STREAM_RETRY_DELAY_MS = 10_000;
const RETRY_JITTER_MS = 1_000;

class FatalStreamError extends Error {}

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
	params: AnnouncementListParams = defaultRecentParams,
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

export function useAnnouncementStream(enabled: boolean) {
	const { tokens } = useAuth();
	const { currentOrgId } = useTenant();
	const queryClient = useQueryClient();
	const accessToken = tokens?.access_token;

	useEffect(() => {
		if (!enabled || !accessToken || !currentOrgId) return;

		const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");
		if (!baseUrl) return;

		const controller = new AbortController();
		let retryCount = 0;

		void fetchEventSource(`${baseUrl}/announcements/stream`, {
			method: "GET",
			headers: {
				Authorization: `Bearer ${accessToken}`,
				"X-Org-Id": currentOrgId,
				Accept: "text/event-stream",
			},
			credentials: "include",
			openWhenHidden: true,
			signal: controller.signal,
			onopen: async (response) => {
				if (
					response.ok &&
					(response.headers.get("content-type") || "").includes(
						"text/event-stream",
					)
				) {
					retryCount = 0;
					return;
				}
				if (response.status === 401 || response.status === 403) {
					throw new FatalStreamError("Unauthorized for announcement stream");
				}
				throw new Error(`Unexpected stream response: ${response.status}`);
			},
			onmessage: (event) => {
				if (event.event && event.event !== "announcement.published") return;
				if (!event.data) return;
				try {
					const payload = JSON.parse(event.data) as { type?: string };
					if (payload?.type !== "announcement.published") return;
				} catch {
					return;
				}
				void queryClient.invalidateQueries({
					queryKey: announcementKeys.unread(),
				});
				void queryClient.invalidateQueries({
					queryKey: announcementKeys.unreadCount(),
				});
			},
			onclose: () => {
				if (!controller.signal.aborted) {
					throw new Error("Announcement stream closed unexpectedly");
				}
			},
			onerror: (error) => {
				if (controller.signal.aborted) return;
				if (error instanceof FatalStreamError) {
					controller.abort();
					return;
				}
				retryCount += 1;
				const backoff = Math.min(
					MAX_STREAM_RETRY_DELAY_MS,
					retryCount * 1000 + Math.floor(Math.random() * RETRY_JITTER_MS),
				);
				return backoff;
			},
		}).catch((error) => {
			if (!controller.signal.aborted) {
				console.warn("Announcement stream stopped", error);
			}
		});

		return () => {
			controller.abort();
		};
	}, [accessToken, currentOrgId, enabled, queryClient]);
}
