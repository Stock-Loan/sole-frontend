import type { EligibilityResult } from "@/entities/stock-grant/types";

export type LoanApplicationStatus =
	| "DRAFT"
	| "SUBMITTED"
	| "CANCELLED"
	| "IN_REVIEW"
	| "ACTIVE"
	| "REJECTED";

export type LoanSelectionMode = "SHARES" | "PERCENT";

export interface LoanQuoteInput {
	selection_mode: LoanSelectionMode;
	selection_value: string;
	as_of_date?: string;
	desired_interest_type?: string;
	desired_repayment_method?: string;
	desired_term_months?: number;
}

export interface LoanQuoteOption {
	interest_type: string;
	repayment_method: string;
	term_months: number;
	nominal_annual_rate: string;
	estimated_monthly_payment: string;
	total_payable: string;
	total_interest: string;
}

export interface LoanAllocationItem {
	grant_id: string;
	grant_date: string;
	shares: number;
	exercise_price: string;
	purchase_price: string;
}

export interface LoanQuoteResponse {
	as_of_date: string;
	selection_mode: LoanSelectionMode;
	selection_value: string;
	total_exercisable_shares: number;
	shares_to_exercise: number;
	purchase_price: string;
	down_payment_amount: string;
	loan_principal: string;
	options: LoanQuoteOption[];
	allocation_strategy: string;
	allocation: LoanAllocationItem[];
	eligibility_result: EligibilityResult;
}

export interface LoanApplicationDraftCreate extends LoanQuoteInput {
	marital_status_snapshot?: string | null;
	spouse_first_name?: string | null;
	spouse_last_name?: string | null;
	spouse_email?: string | null;
	spouse_phone?: string | null;
	spouse_address?: string | null;
}

export type LoanApplicationDraftUpdate = Partial<LoanApplicationDraftCreate>;

export interface LoanApplicationSummary {
	id: string;
	status: LoanApplicationStatus;
	version: number;
	as_of_date?: string | null;
	shares_to_exercise?: number | null;
	loan_principal?: string | null;
	created_at: string;
	updated_at: string;
}

export interface LoanApplicationQuoteInputsSnapshot {
	selection_mode?: LoanSelectionMode;
	selection_value?: string | null;
	desired_term_months?: number | null;
	desired_interest_type?: string | null;
	desired_repayment_method?: string | null;
	as_of_date?: string | null;
}

export interface LoanApplication extends LoanApplicationSummary {
	activation_date?: string | null;
	election_83b_due_date?: string | null;
	selection_mode?: LoanSelectionMode | null;
	selection_value_snapshot?: string | null;
	total_exercisable_shares_snapshot?: number | null;
	purchase_price?: string | null;
	down_payment_amount?: string | null;
	interest_type?: string | null;
	repayment_method?: string | null;
	term_months?: number | null;
	nominal_annual_rate_percent?: string | null;
	estimated_monthly_payment?: string | null;
	total_payable_amount?: string | null;
	total_interest_amount?: string | null;
	allocation_strategy?: string | null;
	allocation_snapshot?: LoanAllocationItem[];
	quote_inputs_snapshot?: LoanApplicationQuoteInputsSnapshot | null;
	quote_option_snapshot?: LoanQuoteOption | null;
	marital_status_snapshot?: string | null;
	spouse_first_name?: string | null;
	spouse_last_name?: string | null;
	spouse_email?: string | null;
	spouse_phone?: string | null;
	spouse_address?: string | null;
	workflow_stages?: LoanWorkflowStage[];
	documents?: LoanDocument[];
	has_share_certificate?: boolean;
	has_83b_election?: boolean;
	days_until_83b_due?: number | null;
	decision_reason?: string | null;
}

export interface LoanWorkflowStage {
	stage_type: string;
	status: string;
	assigned_role_hint?: string | null;
	completed_by_user_id?: string | null;
	completed_at?: string | null;
	notes?: string | null;
}

export interface LoanDocument {
	id: string;
	document_type?: string | null;
	status?: string | null;
	uploaded_by_user_id?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	storage_url?: string | null;
}

export interface LoanApplicationListParams {
	status?: LoanApplicationStatus[] | LoanApplicationStatus;
	limit?: number;
	offset?: number;
	created_from?: string;
	created_to?: string;
}

export interface LoanApplicationListResponse {
	items: LoanApplicationSummary[];
	total: number;
}
