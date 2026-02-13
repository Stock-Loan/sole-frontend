export type AnnouncementStatus =
	| "DRAFT"
	| "PUBLISHED"
	| "UNPUBLISHED"
	| "ARCHIVED";

export type AnnouncementType =
	| "GENERAL"
	| "MAINTENANCE"
	| "OUTAGE"
	| "POLICY"
	| "FEATURE";

export interface Announcement {
	id: string;
	org_id?: string;
	title: string;
	body: string;
	status: AnnouncementStatus;
	type?: AnnouncementType;
	scheduled_at?: string | null;
	published_at?: string | null;
	read_count?: number;
	target_count?: number;
	created_at?: string;
	updated_at?: string;
}

export interface AnnouncementCreatePayload {
	title: string;
	body: string;
	status?: AnnouncementStatus;
	type?: AnnouncementType;
	scheduled_at?: string | null;
}

export type AnnouncementUpdatePayload = Partial<AnnouncementCreatePayload>;

export interface AnnouncementReadSummary {
	read_count?: number;
	target_count?: number;
}

export interface AnnouncementListParams {
	status?: AnnouncementStatus;
	type?: AnnouncementType;
	search?: string;
	page?: number;
	page_size?: number;
}

export interface AnnouncementListResponse {
	items: Announcement[];
	total?: number;
	page?: number;
	page_size?: number;
}

export interface MarkAnnouncementReadResponse {
	status: string;
}

export interface AnnouncementUnreadResponse {
	items: Announcement[];
	total?: number;
}

export interface AnnouncementUnreadCountResponse {
	unread: number;
}

export interface AnnouncementFormValues {
	title: string;
	body: string;
	status: AnnouncementStatus;
	type: AnnouncementType;
	scheduled_at?: string | null;
}

export interface AnnouncementsFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	status: AnnouncementStatus | "ALL";
	onStatusChange: (value: AnnouncementStatus | "ALL") => void;
}

export interface AnnouncementFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialData?: Announcement | null;
	onSubmit: (values: AnnouncementFormValues) => Promise<void>;
	isSubmitting?: boolean;
}

export interface AnnouncementsTableProps {
	items: Announcement[];
	canManage: boolean;
	onEdit: (announcement: Announcement) => void;
	onPublish: (announcement: Announcement) => void;
	onUnpublish: (announcement: Announcement) => void;
	onArchive: (announcement: Announcement) => void;
	isUpdatingStatus?: boolean;
	isFetching?: boolean;
}

export interface AnnouncementMarkdownProps {
	value?: string | null;
	className?: string;
}

export interface AnnouncementBodyEditorProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}
