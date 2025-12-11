export type LoanApplicationStatus =
	| "draft"
	| "submitted"
	| "in_review"
	| "approved"
	| "rejected"
	| "active";

export interface LoanApplicationSummary {
	id: string;
	status: LoanApplicationStatus;
	createdAt: string;
	updatedAt: string;
	principalCents?: number;
}

export interface LoanApplication extends LoanApplicationSummary {
	employeeId?: string;
	orgId: string;
	termMonths?: number;
	repaymentMethod?: string;
	interestType?: string;
}
