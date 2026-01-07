import { z } from "zod";

export const announcementFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	body: z.string().min(1, "Body is required"),
	type: z.enum(["GENERAL", "MAINTENANCE", "OUTAGE", "POLICY", "FEATURE"]),
	status: z.enum(["DRAFT", "PUBLISHED", "UNPUBLISHED", "ARCHIVED"]),
	scheduled_at: z.string().optional().nullable(),
});
