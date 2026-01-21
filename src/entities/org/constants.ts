import type {
	LoanInterestType,
	LoanRepaymentMethod,
	OrgSettingsFormValues,
	OrgSettingsTabKey,
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
export const SETTINGS_TAB_MAP: Partial<
	Record<keyof OrgSettingsFormValues, OrgSettingsTabKey>
> = {
	allow_user_data_export: "general",
	allow_profile_edit: "general",
	require_two_factor: "general",
	mfa_required_actions: "general",
	remember_device_days: "general",
	audit_log_retention_days: "general",
	inactive_user_retention_days: "general",
	enforce_service_duration_rule: "stock",
	min_service_duration_years: "stock",
	enforce_min_vested_to_exercise: "stock",
	min_vested_shares_to_exercise: "stock",
	allowed_repayment_methods: "stock",
	allowed_interest_types: "stock",
	min_loan_term_months: "stock",
	max_loan_term_months: "stock",
	fixed_interest_rate_annual_percent: "stock",
	variable_base_rate_annual_percent: "stock",
	variable_margin_annual_percent: "stock",
	require_down_payment: "stock",
	down_payment_percent: "stock",
};
export const MONTH_LABELS = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
] as const;
