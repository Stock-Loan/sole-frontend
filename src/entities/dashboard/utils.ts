import { formatCurrency } from "@/shared/lib/format";
import type { DashboardStockTotals, MeDashboardSummary } from "./types";

function parseDecimal(value?: string | number | null) {
	if (value === null || value === undefined) return null;
	const numeric =
		typeof value === "number" ? value : Number(String(value).replace(/,/g, ""));
	return Number.isFinite(numeric) ? numeric : null;
}

export function getDashboardStockValueMetrics(
	summary?: MeDashboardSummary | null
) {
	const totals: DashboardStockTotals | null | undefined = summary?.stock_totals;
	const averageExercisePrice = parseDecimal(
		totals?.weighted_avg_exercise_price ?? null
	);
	const totalShares = totals?.total_granted_shares ?? 0;
	const totalStockValue =
		averageExercisePrice !== null ? averageExercisePrice * totalShares : null;

	return {
		averageExercisePrice,
		totalStockValue,
		averageExercisePriceLabel:
			averageExercisePrice !== null
				? formatCurrency(averageExercisePrice)
				: "—",
		totalStockValueLabel:
			totalStockValue !== null ? formatCurrency(totalStockValue) : "—",
	};
}
