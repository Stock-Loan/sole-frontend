import { z } from "zod";
import { nonEmptyString } from "@/shared/lib/validators";

export const loanSpouseInfoSchema = z.object({
	spouse_first_name: nonEmptyString,
	spouse_last_name: nonEmptyString,
	spouse_email: z.string().trim().email("Enter a valid email address"),
	spouse_phone: z
		.string()
		.trim()
		.min(7, "Enter a valid phone number"),
	spouse_address: nonEmptyString,
});

export const loanDocumentCreateSchema = z.object({
	document_type: nonEmptyString,
	file_name: nonEmptyString,
	storage_path_or_url: nonEmptyString,
});

export const loanDocumentUploadSchema = z.object({
	document_type: nonEmptyString,
	file: z.instanceof(File),
});
