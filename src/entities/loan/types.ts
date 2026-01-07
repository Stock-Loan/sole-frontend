export type ActiveLoanStatus = "active" | "closed" | "delinquent";

export interface PaymentScheduleItem {
	dueDate: string;
	amountCents: number;
	paid?: boolean;
}

export interface ActiveLoan {
	id: string;
	orgId: string;
	status: ActiveLoanStatus;
	principalCents: number;
	interestRateBps?: number;
	termMonths?: number;
	nextDueDate?: string | null;
	schedule?: PaymentScheduleItem[];
}

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
