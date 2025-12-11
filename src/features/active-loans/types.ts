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
