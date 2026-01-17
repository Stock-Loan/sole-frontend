import { formatPercent } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import type {
	LoanDocument,
	LoanDocumentGroup,
	LoanSelectionMode,
	LoanWorkflowStageType,
} from "@/entities/loan/types";
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

const workflowStageOrder: LoanWorkflowStageType[] = [
	"HR_REVIEW",
	"FINANCE_PROCESSING",
	"LEGAL_EXECUTION",
	"LEGAL_POST_ISSUANCE",
	"BORROWER_83B_ELECTION",
];

export function groupDocumentsByStage(
	documents?: LoanDocument[] | null
): LoanDocumentGroup[] {
	if (!documents || documents.length === 0) return [];
	const grouped = new Map<LoanWorkflowStageType, LoanDocument[]>();

	for (const document of documents) {
		if (!document.stage_type) continue;
		const items = grouped.get(document.stage_type) ?? [];
		items.push(document);
		grouped.set(document.stage_type, items);
	}

	return workflowStageOrder
		.filter((stageType) => grouped.has(stageType))
		.map((stageType) => ({
			stage_type: stageType,
			documents: grouped.get(stageType) ?? [],
		}));
}
