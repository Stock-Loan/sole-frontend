import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { z } from "zod";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function extractErrorMessage(error: unknown): string | null {
	if (isAxiosError(error)) {
		const data = error.response?.data as
			| { detail?: unknown; message?: unknown }
			| string
			| undefined;
		if (typeof data === "string") return data;
		const detail = data?.detail ?? data?.message;
		const messageFromDetail = pickMessage(detail);
		if (messageFromDetail) return messageFromDetail;
		if (typeof error.message === "string") return error.message;
	} else if (error instanceof Error) {
		return error.message;
	}
	return null;
}

function pickMessage(detail: unknown): string | null {
	if (!detail) return null;
	if (typeof detail === "string") return detail;
	if (Array.isArray(detail) && detail.length) {
		return pickMessage(detail[0]);
	}
	if (typeof detail === "object") {
		const record = detail as Record<string, unknown>;
		if (typeof record.msg === "string") return record.msg;
		if (typeof record.message === "string") return record.message;
		if (typeof record.detail === "string") return record.detail;
	}
	return null;
}

export const formSchema = z.object({
	email: z.string().email("Enter a valid email"),
	first_name: z.string().min(1, "First name is required"),
	middle_name: z.string().optional(),
	last_name: z.string().min(1, "Last name is required"),
	preferred_name: z.string().optional(),
	phone_number: z.string().optional(),
	timezone: z.string().optional(),
	marital_status: z.string().min(1, "Select marital status"),
	country: z.string().min(1, "Select a country"),
	state: z.string().min(1, "Select a state"),
	address_line1: z.string().min(1, "Address line 1 is required"),
	address_line2: z.string().optional(),
	postal_code: z.string().min(1, "Postal code is required"),
	employee_id: z.string().optional(),
	employment_start_date: z.string().optional(),
	employment_status: z.enum(["ACTIVE", "INACTIVE", "LEAVE", "TERMINATED"]),
	temporary_password: z.string().optional(),
});

export const profileSchema = z.object({
	email: z.string().email("Enter a valid email"),
	first_name: z.string().min(1, "First name is required"),
	middle_name: z.string().optional(),
	last_name: z.string().min(1, "Last name is required"),
	preferred_name: z.string().optional(),
	timezone: z.string().optional(),
	phone_number: z.string().optional(),
	marital_status: z.string().min(1, "Select marital status"),
	country: z.string().min(1, "Select a country"),
	state: z.string().min(1, "Select a state"),
	address_line1: z.string().min(1, "Address line 1 is required"),
	address_line2: z.string().optional(),
	postal_code: z.string().min(1, "Postal code is required"),
	employee_id: z.string().optional(),
	employment_status: z.enum(["ACTIVE", "INACTIVE", "LEAVE", "TERMINATED"]),
});
