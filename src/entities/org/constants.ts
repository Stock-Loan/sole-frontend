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
	allow_impersonation: "general",
	require_two_factor: "general",
	mfa_required_actions: "general",
	remember_device_days: "general",
	session_timeout_minutes: "general",
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

export const mfaEnforcementOptions = [
	{
		value: "LOGIN",
		label: "During every login",
		description:
			"Require MFA on every sign-in. This overrides the 'Remember device' setting, forcing users to provide MFA even on trusted devices.",
	},
	{
		value: "LOAN_SUBMISSION",
		label: "During user loan submission",
		description: "Prompt for MFA when users submit a loan application.",
	},
	{
		value: "STOCK_GRANT_ASSIGNMENT",
		label: "Assigning new stock to users",
		description: "Require MFA before creating stock grants for users.",
	},
	{
		value: "STOCK_STATUS_CHANGE",
		label: "Changing stock grant status",
		description:
			"Require MFA before changing a stock grant's status (e.g., Active, Cancelled, Exercised).",
	},
	{
		value: "LOAN_PAYMENT_RECORD",
		label: "Recording loan payments",
		description: "Require MFA before recording a loan repayment.",
	},
	{
		value: "WORKFLOW_COMPLETE",
		label: "Completing workflow stages",
		description:
			"Prompt for MFA before marking HR, Finance, or Legal stages complete.",
	},
	{
		value: "ORG_SETTINGS_CHANGE",
		label: "Changing org settings",
		description: "Require MFA before saving organization settings.",
	},
	{
		value: "USER_PROFILE_EDIT",
		label: "Editing a user's profile",
		description: "Require MFA before admins update user profile fields.",
	},
	{
		value: "ROLE_ASSIGNMENT",
		label: "Assigning roles to users",
		description: "Require MFA before assigning roles to a user.",
	},
	{
		value: "ACL_ASSIGNMENT",
		label: "Managing ACL assignments",
		description: "Require MFA before creating, updating, or removing ACL assignments.",
	},
	{
		value: "USER_IMPERSONATE",
		label: "Impersonating a user",
		description: "Require MFA before an admin can impersonate another user.",
	},
] as const;
