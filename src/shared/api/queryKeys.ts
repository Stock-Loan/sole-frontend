import type { StockSummaryParams } from "@/entities/stock-grant/types";
import type {
	LoanApplicationListParams,
	LoanQuoteInput,
} from "@/entities/loan/types";

export const meKeys = {
	stock: {
		summary: (params?: StockSummaryParams) =>
			["me", "stock", "summary", params ?? {}] as const,
	},
	loans: {
		list: (params?: LoanApplicationListParams) =>
			["me", "loans", "list", params ?? {}] as const,
		detail: (id: string) => ["me", "loans", "detail", id] as const,
		quote: (input?: LoanQuoteInput) =>
			["me", "loans", "quote", input ?? {}] as const,
	},
};
