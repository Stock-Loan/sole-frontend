import { z } from "zod";

const MULTISPACE_RE = /\s+/g;
const MULTI_UNDERSCORE_RE = /_+/g;
const DEPARTMENT_CODE_RE = /^[A-Z0-9_-]+$/;

function normalizeWhitespace(value: string): string {
	return value.trim().replace(MULTISPACE_RE, " ");
}

function toTitleCase(value: string): string {
	return value
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeDepartmentCode(value: string): string {
	const normalized = normalizeWhitespace(value)
		.toUpperCase()
		.replace(MULTISPACE_RE, "_")
		.replace(MULTI_UNDERSCORE_RE, "_")
		.replace(/^_+|_+$/g, "");
	return normalized;
}

export const departmentSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Name is required")
		.transform((value) => toTitleCase(normalizeWhitespace(value))),
	code: z
		.string()
		.trim()
		.min(1, "Code is required")
		.transform((value) => normalizeDepartmentCode(value))
		.refine(
			(value) => DEPARTMENT_CODE_RE.test(value),
			"Code may only contain letters, numbers, '_' and '-'",
		),
});
