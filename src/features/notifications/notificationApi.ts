import type { AnnouncementListParams } from "@/entities/announcement/types";
import {
	getUnreadAnnouncementCount,
	listAnnouncements,
	listUnreadAnnouncements,
	markAnnouncementRead,
} from "@/entities/announcement/api";

export async function listNotifications(params: AnnouncementListParams = {}) {
	return listAnnouncements(params);
}

export async function listUnreadNotifications() {
	return listUnreadAnnouncements();
}

export async function getUnreadNotificationCount() {
	return getUnreadAnnouncementCount();
}

export async function markNotificationRead(id: string) {
	return markAnnouncementRead(id);
}
