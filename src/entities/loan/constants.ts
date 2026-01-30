import type {
	LoanWizardOption,
	LoanWizardStep,
	TimelineStep,
} from "@/entities/loan/types";
import type {
	LoanInterestType,
	LoanRepaymentMethod,
} from "@/entities/org/types";

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

export const loanWizardInterestTypeOptions: LoanWizardOption<LoanInterestType>[] =
	[
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

export const loanWizardRepaymentMethodOptions: LoanWizardOption<LoanRepaymentMethod>[] =
	[
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
export const QUEUE_TABS = [
	{
		id: "hr",
		label: "HR Queue",
		permission: "loan.queue.hr.view",
		description: "Review employee eligibility and policy compliance.",
	},
	{
		id: "finance",
		label: "Finance Queue",
		permission: "loan.queue.finance.view",
		description: "Validate repayment terms and funding readiness.",
	},
	{
		id: "legal",
		label: "Legal Queue",
		permission: "loan.queue.legal.view",
		description: "Confirm document requirements and legal checkpoints.",
	},
] as const;
export const QUEUE_SCOPE_OPTIONS = [
	{ id: "all", label: "All Queue" },
	{ id: "mine", label: "My Queue" },
] as const;
export const timelineSteps: TimelineStep[] = [
	{ key: "hr", label: "HR review", stageType: "HR_REVIEW" },
	{
		key: "finance",
		label: "Finance processing",
		stageType: "FINANCE_PROCESSING",
	},
	{ key: "legal", label: "Legal execution", stageType: "LEGAL_EXECUTION" },
	{ key: "active", label: "Active" },
	{ key: "post", label: "Post-issuance", stageType: "LEGAL_POST_ISSUANCE" },
	{
		key: "election",
		label: "83(b) election",
		stageType: "BORROWER_83B_ELECTION",
	},
];
