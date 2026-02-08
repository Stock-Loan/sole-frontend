import { z } from "zod";
import { nonEmptyString } from "@/shared/lib/validators";

const MULTISPACE_RE = /\s+/g;

function normalizeWhitespace(value: string): string {
	return value.trim().replace(MULTISPACE_RE, " ");
}

function toTitleCase(value: string): string {
	return value
		.toLowerCase()
		.replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeDescription(value: string | null | undefined): string | null {
	if (value == null) return null;
	const cleaned = normalizeWhitespace(value);
	if (!cleaned) return null;
	return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export const roleFormSchema = z.object({
	name: nonEmptyString
		.min(1, "Role name is required")
		.transform((value) => toTitleCase(normalizeWhitespace(value))),
	description: z
		.string()
		.optional()
		.nullable()
		.transform((value) => normalizeDescription(value)),
	permissions: z.array(z.string()).min(1, "Select at least one permission"),
});
