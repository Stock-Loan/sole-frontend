import type {
	LoanInterestType,
	LoanRepaymentMethod,
} from "@/entities/org/types";

export const repaymentMethodOptions: ReadonlyArray<{
	value: LoanRepaymentMethod;
	label: string;
	description: string;
}> = [
	{
		value: "INTEREST_ONLY",
		label: "Interest only",
		description: "Pay interest during the term, principal due at the end.",
	},
	{
		value: "BALLOON",
		label: "Balloon",
		description: "Smaller periodic payments with a larger final payment.",
	},
	{
		value: "PRINCIPAL_AND_INTEREST",
		label: "Principal and interest",
		description: "Standard amortized payments over the term.",
	},
];

export const interestTypeOptions: ReadonlyArray<{
	value: LoanInterestType;
	label: string;
	description: string;
}> = [
	{
		value: "FIXED",
		label: "Fixed",
		description: "Fixed annual interest rate for the full term.",
	},
	{
		value: "VARIABLE",
		label: "Variable",
		description: "Base rate plus margin, adjustable over time.",
	},
];
