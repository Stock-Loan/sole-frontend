type StockSummaryParams = {
	as_of?: string;
};

type AuditLogListParams = {
	page?: number;
	page_size?: number;
	feature?: string[];
	action?: string[];
	resource_type?: string;
	resource_id?: string;
	actor_id?: string;
	created_from?: string;
	created_to?: string;
};

type LoanApplicationListParams = {
	status?: string[] | string;
	stage_type?: string;
	limit?: number;
	offset?: number;
	created_from?: string;
	created_to?: string;
};

type LoanDashboardSummaryParams = {
	as_of?: string;
};

type LoanQuoteInput = {
	selection_mode: string;
	selection_value: string;
	as_of_date?: string;
	desired_interest_type?: string;
	desired_repayment_method?: string;
	desired_term_months?: number;
};

type LoanQueueListParams = {
	limit?: number;
	offset?: number;
};

export const meKeys = {
	dashboard: {
		summary: (params?: { as_of?: string }) =>
			["me", "dashboard", "summary", params ?? {}] as const,
	},
	stock: {
		summary: (params?: StockSummaryParams) =>
			["me", "stock", "summary", params ?? {}] as const,
	},
	loans: {
		list: (params?: LoanApplicationListParams) =>
			["me", "loans", "list", params ?? {}] as const,
		detail: (id: string) => ["me", "loans", "detail", id] as const,
		repayments: (id: string) => ["me", "loans", "repayments", id] as const,
		schedule: (id: string) => ["me", "loans", "schedule", id] as const,
		documents: (id: string) => ["me", "loans", "documents", id] as const,
		documentDownload: (documentId: string) =>
			["me", "loans", "documents", "download", documentId] as const,
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
	documents: {
		folders: {
			list: () => ["org", "documents", "folders"] as const,
		},
		templates: {
			list: (params?: { folder_id?: string | null }) =>
				["org", "documents", "templates", params ?? {}] as const,
			detail: (id: string) => ["org", "documents", "templates", id] as const,
			download: (id: string) =>
				["org", "documents", "templates", "download", id] as const,
		},
	},
	loans: {
		list: (params?: LoanApplicationListParams) =>
			["org", "loans", "list", params ?? {}] as const,
		summary: (params?: LoanDashboardSummaryParams) =>
			["org", "loans", "summary", params ?? {}] as const,
		detail: (id: string) => ["org", "loans", "detail", id] as const,
		repayments: (id: string) => ["org", "loans", "repayments", id] as const,
		schedule: (id: string) => ["org", "loans", "schedule", id] as const,
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
			legal: (id: string) => ["org", "loans", "detail", "legal", id] as const,
		},
		documents: {
			org: (id: string) => ["org", "loans", "documents", id] as const,
			download: (documentId: string) =>
				["org", "loans", "documents", "download", documentId] as const,
		},
	},
	users: {
		summary: () => ["org", "users", "summary"] as const,
	},
};
