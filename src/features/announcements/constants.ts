import type { AnnouncementStatus } from "./types";

export const ANNOUNCEMENT_STATUSES: AnnouncementStatus[] = [
	"DRAFT",
	"PUBLISHED",
	"UNPUBLISHED",
	"ARCHIVED",
];

export const ANNOUNCEMENT_STATUS_LABELS: Record<AnnouncementStatus, string> = {
	DRAFT: "Draft",
	PUBLISHED: "Published",
	UNPUBLISHED: "Unpublished",
	ARCHIVED: "Archived",
};

export const ANNOUNCEMENT_STATUS_TONE: Record<AnnouncementStatus, string> = {
	DRAFT: "border-border bg-muted/50 text-foreground",
	PUBLISHED: "border-emerald-200 bg-emerald-50 text-emerald-800",
	UNPUBLISHED: "border-amber-200 bg-amber-50 text-amber-800",
	ARCHIVED: "border-border bg-muted/40 text-muted-foreground",
};

export const ANNOUNCEMENT_TYPE_COLORS: Record<string, string> = {
	GENERAL: "bg-slate-100 text-slate-800 border-slate-200",
	MAINTENANCE: "bg-blue-100 text-blue-800 border-blue-200",
	OUTAGE: "bg-rose-100 text-rose-800 border-rose-200",
	POLICY: "bg-amber-100 text-amber-800 border-amber-200",
	FEATURE: "bg-emerald-100 text-emerald-800 border-emerald-200",
};
