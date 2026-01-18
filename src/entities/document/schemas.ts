import { z } from "zod";

export const orgDocumentFolderSchema = z.object({
	name: z.string().trim().min(1, "Folder name is required"),
});

export const orgDocumentTemplateUploadSchema = z
	.object({
		file: z.instanceof(File).optional().nullable(),
		folder_id: z.string().trim().optional().nullable(),
		name: z.string().trim().optional().nullable(),
		description: z.string().trim().optional().nullable(),
	})
	.refine((data) => Boolean(data.file), {
		message: "Document file is required",
		path: ["file"],
	});

export type OrgDocumentFolderValues = z.infer<typeof orgDocumentFolderSchema>;
export type OrgDocumentTemplateUploadValues = z.infer<
	typeof orgDocumentTemplateUploadSchema
>;
