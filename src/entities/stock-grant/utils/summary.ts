import { colorPalette } from "@/shared/styles/color-palette";
import { formatCurrency, formatDate, formatPercent } from "@/shared/lib/format";
import type {
	StockDashboardSummary,
	StockDashboardVestingEvent,
	StockSummaryMetric,
} from "@/entities/stock-grant/types";
import type {
	StockSummaryDonutItem,
	StockSummaryGaugeCardProps,
	StockSummaryStackedItem,
	StockSummaryTimelineEvent,
} from "@/entities/stock-grant/components/types";

function formatNumber(value?: number | null) {
	if (value === null || value === undefined) return "—";
	return value.toLocaleString();
}

export function buildStockSummaryMetrics(
	summary?: StockDashboardSummary | null
): StockSummaryMetric[] {
	if (!summary) return [];
	const totals = summary.totals;
	const range = summary.exercise_price_range;
	const nextDate = summary.vesting_timeline?.next_vesting_date;
	const nextShares = summary.vesting_timeline?.next_vesting_shares;

	return [
		{
			label: "Program employees",
			value: formatNumber(totals.program_employees),
		},
		{
			label: "Grant count",
			value: formatNumber(totals.grant_count),
		},
		{
			label: "Total granted shares",
			value: formatNumber(totals.total_granted_shares),
		},
		{
			label: "Total vested shares",
			value: formatNumber(totals.total_vested_shares),
		},
		{
			label: "Total unvested shares",
			value: formatNumber(totals.total_unvested_shares),
		},
		{
			label: "Reserved shares",
			value: formatNumber(totals.total_reserved_shares),
		},
		{
			label: "Available vested shares",
			value: formatNumber(totals.total_available_vested_shares),
		},
		{
			label: "Next vesting event",
			value: formatDate(nextDate ?? undefined),
			helper: nextShares
				? `${formatNumber(nextShares)} shares scheduled`
				: "No upcoming vesting event",
		},
		{
			label: "Exercise price range",
			value:
				range?.min && range?.max
					? `${formatCurrency(range.min)} - ${formatCurrency(range.max)}`
					: "—",
		},
	];
}

export function buildGrantShareStack(
	summary?: StockDashboardSummary | null
): StockSummaryStackedItem[] {
	if (!summary) return [];
	const totals = summary.totals;
	return [
		{
			label: "Granted",
			value: totals.total_granted_shares,
			color: colorPalette.chart[1],
		},
		{
			label: "Vested",
			value: totals.total_vested_shares,
			color: colorPalette.chart[2],
		},
		{
			label: "Unvested",
			value: totals.total_unvested_shares,
			color: colorPalette.chart[3],
		},
	];
}

export function buildReservedShareStack(
	summary?: StockDashboardSummary | null
): StockSummaryStackedItem[] {
	if (!summary) return [];
	const totals = summary.totals;
	return [
		{
			label: "Reserved",
			value: totals.total_reserved_shares,
			color: colorPalette.status.warning[500],
		},
		{
			label: "Available",
			value: totals.total_available_vested_shares,
			color: colorPalette.status.success[500],
		},
	];
}

export function buildEligibilityDonutItems(
	summary?: StockDashboardSummary | null
): StockSummaryDonutItem[] {
	if (!summary) return [];
	const eligibility = summary.eligibility;
	return [
		{
			label: "Eligible",
			value: eligibility.eligible_to_exercise_count,
			color: colorPalette.status.success[500],
		},
		{
			label: "Service rule",
			value: eligibility.not_eligible_due_to_service_count,
			color: colorPalette.status.warning[500],
		},
		{
			label: "Min vested rule",
			value: eligibility.not_eligible_due_to_min_vested_count,
			color: colorPalette.status.info[500],
		},
		{
			label: "Other",
			value: eligibility.not_eligible_due_to_other_count,
			color: colorPalette.status.danger[500],
		},
	];
}

export function buildGrantStatusDonutItems(
	summary?: StockDashboardSummary | null
): StockSummaryDonutItem[] {
	if (!summary) return [];
	const statuses = summary.grant_mix.by_status;
	return [
		{
			label: "Active",
			value: statuses.ACTIVE ?? 0,
			color: colorPalette.status.success[500],
		},
		{
			label: "Cancelled",
			value: statuses.CANCELLED ?? 0,
			color: colorPalette.status.warning[500],
		},
		{
			label: "Exercised out",
			value: statuses.EXERCISED_OUT ?? 0,
			color: colorPalette.status.info[500],
		},
	];
}

export function buildGrantStrategyDonutItems(
	summary?: StockDashboardSummary | null
): StockSummaryDonutItem[] {
	if (!summary) return [];
	const strategies = summary.grant_mix.by_vesting_strategy;
	return [
		{
			label: "Immediate",
			value: strategies.IMMEDIATE ?? 0,
			color: colorPalette.chart[1],
		},
		{
			label: "Scheduled",
			value: strategies.SCHEDULED ?? 0,
			color: colorPalette.chart[2],
		},
	];
}

export function buildEligibilityGauge(
	summary?: StockDashboardSummary | null
): StockSummaryGaugeCardProps | null {
	if (!summary) return null;
	const eligibility = summary.eligibility;
	const total =
		eligibility.eligible_to_exercise_count +
		eligibility.not_eligible_due_to_service_count +
		eligibility.not_eligible_due_to_min_vested_count +
		eligibility.not_eligible_due_to_other_count;
	const percent = total > 0 ? (eligibility.eligible_to_exercise_count / total) * 100 : 0;
	return {
		title: "Eligibility rate",
		value: Number(percent.toFixed(1)),
		helper: `${formatNumber(eligibility.eligible_to_exercise_count)} eligible of ${formatNumber(total)}`,
		color: colorPalette.status.success[500],
	};
}

export function buildReservedGauge(
	summary?: StockDashboardSummary | null
): StockSummaryGaugeCardProps | null {
	if (!summary) return null;
	const raw = summary.reservation_pressure.reserved_share_percent_of_vested;
	const numeric = Number(String(raw).replace(/%/g, "").trim());
	const percent = Number.isFinite(numeric) ? numeric : 0;
	return {
		title: "Reserved share pressure",
		value: Number(percent.toFixed(1)),
		helper: `Reserved ${formatPercent(percent)} of vested shares`,
		color: colorPalette.status.warning[500],
	};
}

export function buildVestingTimelineEvents(
	events: StockDashboardVestingEvent[] = []
): StockSummaryTimelineEvent[] {
	return [...events]
		.sort((a, b) => a.vest_date.localeCompare(b.vest_date))
		.map((event) => ({
			vest_date: event.vest_date,
			shares: event.shares,
		}));
}
