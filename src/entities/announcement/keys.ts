import type { AnnouncementListParams } from "./types";

export const announcementKeys = {
	list: (params?: AnnouncementListParams) =>
		["announcements", "list", params ?? {}] as const,
	detail: (id: string) => ["announcements", "detail", id] as const,
	unread: () => ["announcements", "unread"] as const,
	unreadCount: () => ["announcements", "unread", "count"] as const,
	adminList: (params?: AnnouncementListParams) =>
		["announcements", "admin", params ?? {}] as const,
};
