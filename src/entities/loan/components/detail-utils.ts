import { formatPercent } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import type { LoanSelectionMode } from "@/entities/loan/types";
import type { EligibilityReason } from "@/entities/stock-grant/types";
import type {
	LoanDetailValue,
	LoanSelectionValue,
} from "@/entities/loan/components/types";

export function formatDetailValue(value?: LoanDetailValue) {
	if (value === null || value === undefined) return "—";
	if (typeof value === "string" && value.trim() === "") return "—";
	return String(value);
}

export function formatDetailBoolean(value?: boolean | null) {
	if (value === null || value === undefined) return "—";
	return value ? "Yes" : "No";
}

export function formatLoanSelectionValue(
	mode?: LoanSelectionMode | null,
	value?: LoanSelectionValue
) {
	if (value === null || value === undefined || value.trim() === "") return "—";
	if (mode === "PERCENT") {
		return formatPercent(value);
	}
	return value;
}

export function formatEligibilityReasons(
	reasons?: EligibilityReason[] | null
) {
	if (!reasons || reasons.length === 0) return "None";
	return reasons.map((reason) => reason.message || reason.code).join(", ");
}

export function formatList(values?: string[] | null) {
	if (!values || values.length === 0) return "—";
	return values.map((value) => normalizeDisplay(value)).join(", ");
}

export function formatYears(value?: string | number | null) {
	if (value === null || value === undefined) return "—";
	const raw = String(value).trim();
	if (!raw) return "—";
	return `${raw} years`;
}
