export type AnnouncementStatus = "draft" | "published" | "archived";

export interface Announcement {
	id: string;
	orgId: string;
	title: string;
	body: string;
	status: AnnouncementStatus;
	publishedAt?: string | null;
	authorId?: string;
}
