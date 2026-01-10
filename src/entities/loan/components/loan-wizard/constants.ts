import type { LoanWizardOption, LoanWizardStep } from "./types";

export const loanWizardSteps: LoanWizardStep[] = [
	{
		key: "exercise",
		title: "Exercise amount",
		description: "Choose how many shares to exercise.",
	},
	{
		key: "terms",
		title: "Loan terms",
		description: "Pick repayment method, interest type, and term.",
	},
	{
		key: "marital",
		title: "Marital status",
		description: "Confirm marital status and spouse details.",
	},
	{
		key: "review",
		title: "Review & submit",
		description: "Review and submit your loan application.",
	},
];

export const loanWizardInterestTypeOptions: LoanWizardOption[] = [
	{
		value: "FIXED",
		label: "Fixed",
		description: "Fixed annual rate for the full term.",
	},
	{
		value: "VARIABLE",
		label: "Variable",
		description: "Base rate plus margin, adjustable over time.",
	},
];

export const loanWizardRepaymentMethodOptions: LoanWizardOption[] = [
	{
		value: "INTEREST_ONLY",
		label: "Interest only",
		description: "Interest payments with principal due at the end.",
	},
	{
		value: "BALLOON",
		label: "Balloon",
		description: "Smaller payments with a larger final payment.",
	},
	{
		value: "PRINCIPAL_AND_INTEREST",
		label: "Principal and interest",
		description: "Standard amortized payments over the term.",
	},
];
