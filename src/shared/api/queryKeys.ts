import type { StockSummaryParams } from "@/entities/stock-grant/types";
import type { AuditLogListParams } from "@/entities/audit/types";
import type {
	LoanApplicationListParams,
	LoanQuoteInput,
	LoanQueueListParams,
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
		documents: (id: string) => ["me", "loans", "documents", id] as const,
		quote: (input?: LoanQuoteInput) =>
			["me", "loans", "quote", input ?? {}] as const,
	},
};

export const orgKeys = {
	audit: {
		logs: {
			list: (params?: AuditLogListParams) =>
				["org", "audit", "logs", params ?? {}] as const,
		},
	},
	loans: {
		list: (params?: LoanApplicationListParams) =>
			["org", "loans", "list", params ?? {}] as const,
		detail: (id: string) => ["org", "loans", "detail", id] as const,
		queue: {
			hr: (params?: LoanQueueListParams) =>
				["org", "loans", "queue", "hr", params ?? {}] as const,
			finance: (params?: LoanQueueListParams) =>
				["org", "loans", "queue", "finance", params ?? {}] as const,
			legal: (params?: LoanQueueListParams) =>
				["org", "loans", "queue", "legal", params ?? {}] as const,
			me: {
				hr: (params?: LoanQueueListParams) =>
					["org", "loans", "queue", "me", "hr", params ?? {}] as const,
				finance: (params?: LoanQueueListParams) =>
					["org", "loans", "queue", "me", "finance", params ?? {}] as const,
				legal: (params?: LoanQueueListParams) =>
					["org", "loans", "queue", "me", "legal", params ?? {}] as const,
			},
		},
		workflowDetail: {
			hr: (id: string) => ["org", "loans", "detail", "hr", id] as const,
			finance: (id: string) =>
				["org", "loans", "detail", "finance", id] as const,
			legal: (id: string) =>
				["org", "loans", "detail", "legal", id] as const,
		},
		documents: {
			org: (id: string) => ["org", "loans", "documents", id] as const,
		},
	},
};
