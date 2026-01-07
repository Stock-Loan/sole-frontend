import type { StockGrantListParams, StockSummaryParams } from "./types";

export const stockGrantKeys = {
	summary: (membershipId: string, params?: StockSummaryParams) =>
		["stock", "summary", membershipId, params ?? {}] as const,
	grants: {
		list: (membershipId: string, params?: StockGrantListParams) =>
			["stock", "grants", "list", membershipId, params ?? {}] as const,
		all: (membershipId: string) =>
			["stock", "grants", "all", membershipId] as const,
	},
};
