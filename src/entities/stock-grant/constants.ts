import { formatYearsInText } from "@/shared/lib/format";
import type { EligibilityReason, EligibilityReasonCode } from "./types";

const eligibilityReasonFallbacks: Record<EligibilityReasonCode, string> = {
	EMPLOYMENT_INACTIVE: "Employment is not active.",
	INSUFFICIENT_SERVICE_DURATION: "Insufficient service duration.",
	NO_VESTED_SHARES: "No vested shares are available to exercise.",
	BELOW_MIN_VESTED_THRESHOLD: "Below minimum vested threshold.",
};

export function formatShares(value?: number | null) {
	if (value === null || value === undefined) return "—";
	return value.toLocaleString();
}

export function getEligibilityReasonLabel(reason: EligibilityReason) {
	const message =
		reason.message || eligibilityReasonFallbacks[reason.code] || reason.code;
	return formatYearsInText(message);
}
