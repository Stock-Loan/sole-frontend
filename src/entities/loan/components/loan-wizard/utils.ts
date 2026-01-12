import { parseApiError } from "@/shared/api/errors";
import type { ReviewErrorSection } from "@/entities/loan/types";

export function extractSubmitError(error: unknown): {
	message: string;
	section: ReviewErrorSection;
} {
	const apiError = parseApiError(error);
	const fallbackMessage =
		apiError.message ||
		"Unable to submit your application. Please review your details and try again.";
	let message = fallbackMessage;
	let section: ReviewErrorSection = null;

	const detail = apiError.detail;
	if (detail && typeof detail === "object" && detail !== null) {
		const detailRecord = detail as Record<string, unknown>;
		const code =
			typeof detailRecord.code === "string"
				? detailRecord.code
				: typeof detailRecord.error_code === "string"
				? detailRecord.error_code
				: typeof detailRecord.error === "string"
				? detailRecord.error
				: null;
		const detailMessage =
			typeof detailRecord.message === "string" ? detailRecord.message : null;
		const details = detailRecord.details as Record<string, unknown> | undefined;
		const missingFields = Array.isArray(details?.missing_fields)
			? (details?.missing_fields as string[])
			: Array.isArray(detailRecord.missing_fields)
			? (detailRecord.missing_fields as string[])
			: null;

		if (detailMessage) {
			message = detailMessage;
		}
		if (missingFields && missingFields.length > 0) {
			message = `Missing required fields: ${missingFields.join(", ")}`;
		}

		const normalized = (code ?? message).toLowerCase();
		if (normalized.includes("marital")) {
			section = "consents";
			message =
				"Marital status on file does not match HR records. Please contact HR to update your profile.";
		} else if (normalized.includes("spouse")) {
			section = "consents";
			message = "Spouse/partner information is required before submitting.";
		} else if (normalized.includes("eligibility")) {
			section = "exercise";
			message =
				"Your eligibility has changed. Please review your exercise selection.";
		} else if (normalized.includes("policy")) {
			section = "terms";
			message = "Loan policy settings changed. Please review your loan terms.";
		}
	}

	return { message, section };
}
