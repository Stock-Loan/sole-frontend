import { apiClient } from "@/lib/apiClient";
import type {
	Announcement,
	AnnouncementCreatePayload,
	AnnouncementListParams,
	AnnouncementListResponse,
	AnnouncementStatus,
	AnnouncementUpdatePayload,
	AnnouncementUnreadCountResponse,
	AnnouncementUnreadResponse,
	MarkAnnouncementReadResponse,
} from "../types";

export async function listAnnouncements(
	params: AnnouncementListParams = {}
): Promise<AnnouncementListResponse> {
	const { data } = await apiClient.get<AnnouncementListResponse>("/announcements", {
		params,
	});
	return data;
}

export async function listAdminAnnouncements(
	params: AnnouncementListParams = {}
): Promise<AnnouncementListResponse> {
	const { data } = await apiClient.get<AnnouncementListResponse>(
		"/announcements/admin",
		{ params }
	);
	return data;
}

export async function getAnnouncement(id: string): Promise<Announcement> {
	const { data } = await apiClient.get<Announcement>(`/announcements/${id}`);
	return data;
}

export async function createAnnouncement(
	payload: AnnouncementCreatePayload
): Promise<Announcement> {
	const { data } = await apiClient.post<Announcement>("/announcements", payload);
	return data;
}

export async function updateAnnouncement(
	id: string,
	payload: AnnouncementUpdatePayload
): Promise<Announcement> {
	const { data } = await apiClient.patch<Announcement>(`/announcements/${id}`, payload);
	return data;
}

export async function changeAnnouncementStatus(
	id: string,
	status: AnnouncementStatus
): Promise<Announcement> {
	return updateAnnouncement(id, { status });
}

export async function markAnnouncementRead(
	id: string
): Promise<MarkAnnouncementReadResponse> {
	const { data } = await apiClient.post<MarkAnnouncementReadResponse>(
		`/announcements/${id}/read`
	);
	return data;
}

export async function listUnreadAnnouncements(): Promise<AnnouncementUnreadResponse> {
	const { data } = await apiClient.get<AnnouncementUnreadResponse>(
		"/announcements/unread"
	);
	return data;
}

export async function getUnreadAnnouncementCount(): Promise<AnnouncementUnreadCountResponse> {
	const { data } = await apiClient.get<AnnouncementUnreadCountResponse>(
		"/announcements/unread/count"
	);
	return data;
}
