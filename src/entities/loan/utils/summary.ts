import { formatCurrency, formatDate } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import { colorPalette } from "@/app/styles/color-palette";
import type { LoanDashboardSummary } from "@/entities/loan/types";
import type {
	LoanSummaryBarItem,
	LoanSummaryMetric,
} from "@/entities/loan/components/types";

const statusOrder = [
	"SUBMITTED",
	"IN_REVIEW",
	"ACTIVE",
	"COMPLETED",
	"REJECTED",
	"CANCELLED",
	"DRAFT",
] as const;

const stageOrder = [
	"HR_REVIEW",
	"FINANCE_PROCESSING",
	"LEGAL_EXECUTION",
] as const;

const formatCount = (value?: number | null) =>
	value === null || value === undefined ? "—" : value.toLocaleString();

export function buildLoanSummaryMetrics(
	summary?: LoanDashboardSummary | null
): LoanSummaryMetric[] {
	if (!summary) return [];

	return [
		{ label: "Total loans", value: formatCount(summary.total_loans) },
		{
			label: "Total applications",
			value: formatCount(summary.total_applications),
		},
		{ label: "Approved", value: formatCount(summary.approved_count) },
		{ label: "Drafts", value: formatCount(summary.draft_count) },
		{
			label: "Created (30 days)",
			value: formatCount(summary.created_last_30_days),
		},
		{
			label: "Activated (30 days)",
			value: formatCount(summary.activated_last_30_days),
		},
		{
			label: "Active principal",
			value: formatCurrency(summary.active_loan_principal_sum),
		},
		{
			label: "Amount paid",
			value: formatCurrency(summary.sum_amount_paid),
		},
		{
			label: "Amount owed",
			value: formatCurrency(summary.sum_amount_owed),
		},
		{
			label: "Interest earned",
			value: formatCurrency(summary.interest_earned_total),
		},
		{
			label: "Active shares",
			value: formatCount(summary.active_loan_total_shares),
		},
		{
			label: "Completed shares",
			value: formatCount(summary.completed_loan_total_shares),
		},
		{
			label: "As of date",
			value: formatDate(summary.as_of),
		},
	];
}

export function buildLoanStatusItems(
	summary?: LoanDashboardSummary | null
): LoanSummaryBarItem[] {
	if (!summary) return [];
	const counts = summary.status_counts ?? {};
	const colors = {
		SUBMITTED: colorPalette.status.info[500],
		IN_REVIEW: colorPalette.status.warning[500],
		ACTIVE: colorPalette.status.success[500],
		COMPLETED: colorPalette.status.success[500],
		REJECTED: colorPalette.status.danger[500],
		CANCELLED: colorPalette.slate[400],
		DRAFT: colorPalette.slate[300],
	} as const;

	return statusOrder.map((status) => ({
		label: normalizeDisplay(status),
		value: counts[status] ?? 0,
		color: colors[status],
	}));
}

export function buildLoanStageItems(
	summary?: LoanDashboardSummary | null
): LoanSummaryBarItem[] {
	if (!summary) return [];
	const counts = summary.open_stage_counts ?? {};
	const fallbackCounts = {
		HR_REVIEW: summary.pending_hr,
		FINANCE_PROCESSING: summary.pending_finance,
		LEGAL_EXECUTION: summary.pending_legal,
	};

	return stageOrder.map((stage, index) => ({
		label: normalizeDisplay(stage),
		value: counts[stage] ?? fallbackCounts[stage] ?? 0,
		color: Object.values(colorPalette.chart)[index % 6],
	}));
}

export function buildActiveInterestItems(
	summary?: LoanDashboardSummary | null
): LoanSummaryBarItem[] {
	if (!summary) return [];
	return [
		{
			label: "Fixed",
			value: summary.active_fixed_count,
			color: colorPalette.chart[1],
		},
		{
			label: "Variable",
			value: summary.active_variable_count,
			color: colorPalette.chart[2],
		},
	];
}

export function buildActiveRepaymentItems(
	summary?: LoanDashboardSummary | null
): LoanSummaryBarItem[] {
	if (!summary) return [];
	return [
		{
			label: "Interest only",
			value: summary.active_interest_only_count,
			color: colorPalette.chart[3],
		},
		{
			label: "Balloon",
			value: summary.active_balloon_count,
			color: colorPalette.chart[4],
		},
		{
			label: "Principal & interest",
			value: summary.active_principal_and_interest_count,
			color: colorPalette.chart[5],
		},
	];
}
