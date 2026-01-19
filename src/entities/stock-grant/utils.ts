import type { StockSummary } from "./types";

function parseExercisePrice(value?: string | null): number | null {
	if (!value) return null;
	const numeric = Number(value.replace(/,/g, "").trim());
	return Number.isFinite(numeric) ? numeric : null;
}

export function getStockValueMetrics(summary?: StockSummary | null) {
	if (!summary) {
		return { averageExercisePrice: null, totalStockValue: null };
	}

	const totalShares =
		summary.total_granted_shares ??
		summary.grants.reduce((sum, grant) => sum + (grant.total_shares ?? 0), 0);

	const totalStockValue = summary.grants.reduce((sum, grant) => {
		const shares = grant.total_shares ?? 0;
		const price = parseExercisePrice(grant.exercise_price);
		if (price === null || !Number.isFinite(price)) return sum;
		return sum + shares * price;
	}, 0);

	if (!totalShares) {
		return { averageExercisePrice: null, totalStockValue: null };
	}

	const averageExercisePrice = totalStockValue / totalShares;

	return { averageExercisePrice, totalStockValue };
}
