export interface OrgSettings {
	org_id: string;
	allow_user_data_export: boolean;
	allow_profile_edit: boolean;
	require_two_factor: boolean;
	audit_log_retention_days: number;
	inactive_user_retention_days: number;
	enforce_service_duration_rule: boolean;
	min_service_duration_years: number | null;
	enforce_min_vested_to_exercise: boolean;
	min_vested_shares_to_exercise: number | null;
	allowed_repayment_methods: LoanRepaymentMethod[];
	allowed_interest_types: LoanInterestType[];
	min_loan_term_months: number;
	max_loan_term_months: number;
	fixed_interest_rate_annual_percent: DecimalValue;
	variable_base_rate_annual_percent: DecimalValue;
	variable_margin_annual_percent: DecimalValue;
	require_down_payment: boolean;
	down_payment_percent: DecimalValue;
	created_at?: string;
	updated_at?: string;
}

export interface OrgSettingsUpdatePayload {
	allow_user_data_export?: boolean;
	allow_profile_edit?: boolean;
	require_two_factor?: boolean;
	audit_log_retention_days?: number;
	inactive_user_retention_days?: number;
	enforce_service_duration_rule?: boolean;
	min_service_duration_years?: number | null;
	enforce_min_vested_to_exercise?: boolean;
	min_vested_shares_to_exercise?: number | null;
	allowed_repayment_methods?: LoanRepaymentMethod[];
	allowed_interest_types?: LoanInterestType[];
	min_loan_term_months?: number;
	max_loan_term_months?: number;
	fixed_interest_rate_annual_percent?: DecimalValue;
	variable_base_rate_annual_percent?: DecimalValue;
	variable_margin_annual_percent?: DecimalValue;
	require_down_payment?: boolean;
	down_payment_percent?: DecimalValue;
}

export interface OrgSettingsFormValues {
	allow_user_data_export: boolean;
	allow_profile_edit: boolean;
	require_two_factor: boolean;
	audit_log_retention_days: number;
	inactive_user_retention_days: number;
	enforce_service_duration_rule: boolean;
	min_service_duration_years: number | null;
	enforce_min_vested_to_exercise: boolean;
	min_vested_shares_to_exercise: number | null;
	allowed_repayment_methods: LoanRepaymentMethod[];
	allowed_interest_types: LoanInterestType[];
	min_loan_term_months: number;
	max_loan_term_months: number;
	fixed_interest_rate_annual_percent: number | null;
	variable_base_rate_annual_percent: number | null;
	variable_margin_annual_percent: number | null;
	require_down_payment: boolean;
	down_payment_percent: number | null;
}

export type OrgSettingsTabKey = "general" | "retention" | "stock" | "loans";

export type LoanRepaymentMethod =
	| "INTEREST_ONLY"
	| "BALLOON"
	| "PRINCIPAL_AND_INTEREST";

export type LoanInterestType = "FIXED" | "VARIABLE";

export type DecimalValue = string | number | null;

export interface OrgSummary {
	id: string;
	name: string;
	slug?: string;
	status?: "active" | "inactive" | "suspended";
}

export interface SelfOrgPolicy {
	org_id: string;
	allow_user_data_export?: boolean;
	allow_profile_edit?: boolean;
	require_two_factor?: boolean;
	enforce_service_duration_rule?: boolean;
	min_service_duration_years?: number | null;
	enforce_min_vested_to_exercise?: boolean;
	min_vested_shares_to_exercise?: number | null;
	allowed_repayment_methods: LoanRepaymentMethod[];
	allowed_interest_types: LoanInterestType[];
	min_loan_term_months: number;
	max_loan_term_months: number;
	fixed_interest_rate_annual_percent: DecimalValue;
	variable_base_rate_annual_percent: DecimalValue;
	variable_margin_annual_percent: DecimalValue;
	require_down_payment: boolean;
	down_payment_percent: DecimalValue;
}
