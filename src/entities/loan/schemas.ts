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
	storage_key: nonEmptyString,
	storage_provider: nonEmptyString,
	storage_bucket: nonEmptyString,
	content_type: nonEmptyString,
	size_bytes: z.coerce.number().int().positive(),
	checksum: z.string().trim().optional().or(z.literal("")),
});

export const loanDocumentUploadSchema = z.object({
	document_type: nonEmptyString,
	file: z.instanceof(File),
});

export const loanRepaymentSchema = z.object({
	payment_date: nonEmptyString,
	extra_principal_amount: z.string().trim().optional().or(z.literal("")),
	extra_interest_amount: z.string().trim().optional().or(z.literal("")),
	amount: z.string().trim().optional().or(z.literal("")),
	principal_amount: z.string().trim().optional().or(z.literal("")),
	interest_amount: z.string().trim().optional().or(z.literal("")),
	evidence_file: z
		.instanceof(File)
		.optional()
		.nullable(),
});

export const loanScheduleWhatIfSchema = z.object({
	as_of_date: nonEmptyString,
	repayment_method: z.enum([
		"BALLOON",
		"PRINCIPAL_AND_INTEREST",
	]),
	term_months: z.coerce.number().int().positive("Enter a valid term"),
	annual_rate_percent: nonEmptyString,
	principal: z.string().trim().optional().or(z.literal("")),
});
