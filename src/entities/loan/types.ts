import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import type { loanSpouseInfoSchema } from "@/entities/loan/schemas";
import type {
	DecimalValue,
	LoanInterestType,
	LoanRepaymentMethod,
	SelfOrgPolicy,
} from "@/entities/org/types";
import type {
	EligibilityResult,
	StockSummary,
} from "@/entities/stock-grant/types";

export type LoanWizardStepKey = "exercise" | "terms" | "marital" | "review";

export interface LoanWizardStep {
	key: LoanWizardStepKey;
	title: string;
	description: string;
}

export interface LoanWizardOption<T extends string = string> {
	value: T;
	label: string;
	description: string;
}

export type LoanApplicationStatus =
	| "DRAFT"
	| "SUBMITTED"
	| "CANCELLED"
	| "IN_REVIEW"
	| "ACTIVE"
	| "REJECTED"
	| "COMPLETED";

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

export interface LoanRepayment {
	id: string;
	org_id?: string;
	loan_application_id: string;
	amount: string;
	principal_amount: string;
	interest_amount: string;
	payment_date: string;
	recorded_by_user_id?: string | null;
	recorded_by_name?: string | null;
	evidence_file_name?: string | null;
	evidence_storage_path_or_url?: string | null;
	evidence_content_type?: string | null;
	created_at?: string | null;
}

export interface LoanRepaymentsResponse {
	loan_id: string;
	total: number;
	items: LoanRepayment[];
}

export interface LoanRepaymentCreatePayload {
	payment_date: string;
	evidence_file?: File | null;
	extra_principal_amount?: string;
	extra_interest_amount?: string;
	amount?: string;
	principal_amount?: string;
	interest_amount?: string;
}

export interface LoanRepaymentRecordResponse {
	repayment: LoanRepayment;
	next_payment_date?: string | null;
	next_payment_amount?: string | null;
	next_principal_due?: string | null;
	next_interest_due?: string | null;
	principal_remaining?: string | null;
	interest_remaining?: string | null;
	total_remaining?: string | null;
}

export interface LoanScheduleEntry {
	period: number;
	due_date: string;
	payment: string;
	principal: string;
	interest: string;
	remaining_balance: string;
}

export interface LoanScheduleResponse {
	loan_id: string;
	as_of_date: string;
	repayment_method: LoanRepaymentMethod;
	term_months: number;
	principal: string;
	annual_rate_percent: string;
	estimated_monthly_payment: string;
	entries: LoanScheduleEntry[];
}

export interface LoanDashboardSummaryParams {
	as_of?: string;
}

export interface LoanDashboardSummary {
	org_id: string;
	as_of: string;
	total_loans: number;
	status_counts: Partial<Record<LoanApplicationStatus, number>>;
	open_stage_counts: Partial<Record<LoanWorkflowStageType, number>>;
	created_last_30_days: number;
	activated_last_30_days: number;
	total_applications: number;
	approved_count: number;
	draft_count: number;
	active_loan_principal_sum: string;
	sum_amount_paid: string;
	sum_amount_owed: string;
	interest_earned_total: string;
	active_loan_total_shares: number;
	completed_loan_total_shares: number;
	pending_hr: number;
	pending_finance: number;
	pending_legal: number;
	active_fixed_count: number;
	active_variable_count: number;
	active_interest_only_count: number;
	active_balloon_count: number;
	active_principal_and_interest_count: number;
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
	org_id?: string | null;
	org_membership_id?: string | null;
	applicant?: LoanApplicantSummary | null;
	current_stage_assignee?: LoanStageAssignee | null;
	current_stage_assigned_at?: string | null;
	shares_to_exercise?: number | null;
	total_exercisable_shares_snapshot?: number | null;
	purchase_price?: string | null;
	down_payment_amount?: string | null;
	loan_principal?: string | null;
	estimated_monthly_payment?: string | null;
	total_payable_amount?: string | null;
	interest_type?: string | null;
	repayment_method?: string | null;
	term_months?: number | null;
	current_stage_type?: LoanWorkflowStageType | null;
	current_stage_status?: LoanWorkflowStageStatus | null;
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
	purchase_price?: string | null;
	down_payment_amount?: string | null;
	interest_type?: string | null;
	repayment_method?: string | null;
	term_months?: number | null;
	nominal_annual_rate_percent?: string | null;
	estimated_monthly_payment?: string | null;
	total_payable_amount?: string | null;
	total_interest_amount?: string | null;
	next_payment_date?: string | null;
	next_payment_amount?: string | null;
	next_principal_due?: string | null;
	next_interest_due?: string | null;
	principal_remaining?: string | null;
	interest_remaining?: string | null;
	total_remaining?: string | null;
	missed_payment_count?: number | null;
	missed_payment_amount_total?: string | null;
	missed_payment_dates?: string[];
	policy_version_snapshot?: number | null;
	allocation_strategy?: string | null;
	allocation_snapshot?: LoanAllocationItem[];
	quote_inputs_snapshot?: LoanApplicationQuoteInputsSnapshot | null;
	quote_option_snapshot?: LoanQuoteOption | null;
	org_settings_snapshot?: LoanOrgSettingsSnapshot | null;
	eligibility_result_snapshot?: EligibilityResult | null;
	marital_status_snapshot?: string | null;
	spouse_first_name?: string | null;
	spouse_middle_name?: string | null;
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

export interface LoanApplicantSummary {
	org_membership_id: string;
	user_id: string;
	full_name: string;
	email: string;
	employee_id?: string | null;
	department_id?: string | null;
	department_name?: string | null;
}

export interface LoanOrgSettingsSnapshot {
	enforce_service_duration_rule: boolean;
	min_service_duration_years: DecimalValue;
	enforce_min_vested_to_exercise: boolean;
	min_vested_shares_to_exercise: number | null;
	allowed_repayment_methods: LoanRepaymentMethod[];
	min_loan_term_months: number;
	max_loan_term_months: number;
	allowed_interest_types: LoanInterestType[];
	fixed_interest_rate_annual_percent: DecimalValue;
	variable_base_rate_annual_percent: DecimalValue;
	variable_margin_annual_percent: DecimalValue;
	require_down_payment: boolean;
	down_payment_percent: DecimalValue;
	policy_version: number;
}

export type LoanWorkflowStageType =
	| "HR_REVIEW"
	| "FINANCE_PROCESSING"
	| "LEGAL_EXECUTION"
	| "LEGAL_POST_ISSUANCE"
	| "BORROWER_83B_ELECTION";

export type LoanWorkflowStageStatus =
	| "PENDING"
	| "IN_PROGRESS"
	| "COMPLETED";

export interface LoanWorkflowStage {
	id?: string;
	org_id?: string;
	loan_application_id?: string;
	stage_type: LoanWorkflowStageType;
	status: LoanWorkflowStageStatus;
	assigned_role_hint?: string | null;
	assigned_to_user_id?: string | null;
	assigned_by_user_id?: string | null;
	assigned_at?: string | null;
	completed_by_user_id?: string | null;
	completed_at?: string | null;
	notes?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
}

export interface LoanDocument {
	id?: string | null;
	org_id?: string;
	loan_application_id?: string;
	stage_type?: LoanWorkflowStageType | null;
	document_type?: string | null;
	file_name?: string | null;
	storage_path_or_url?: string | null;
	uploaded_by_user_id?: string | null;
	uploaded_at?: string | null;
	created_at?: string | null;
	updated_at?: string | null;
	storage_url?: string | null;
	status?: string | null;
}

export interface LoanDocumentGroup {
	stage_type: LoanWorkflowStageType;
	documents: LoanDocument[];
}

export interface LoanStageAssignee {
	user_id: string;
	full_name?: string | null;
	email?: string | null;
}

export interface LoanDocumentsGroupedResponse {
	loan_id: string;
	total: number;
	groups: LoanDocumentGroup[];
}

export interface LoanActivateBacklogResponse {
	checked: number;
	activated: number;
	skipped: number;
	activated_ids: string[];
}

export interface LoanWorkflowStageUpdatePayload {
	status: LoanWorkflowStageStatus;
	notes?: string | null;
}

export interface LoanWorkflowAssignPayload {
	assignee_user_id?: string;
}

export interface LoanDocumentCreatePayload {
	document_type: string;
	file_name: string;
	storage_path_or_url: string;
}

export interface LoanDocumentUploadPayload {
	document_type: string;
	file: File;
}

export interface HrLoanDetailResponse {
	loan_application: LoanApplication;
	stock_summary?: StockSummary | null;
	hr_stage?: LoanWorkflowStage | null;
}

export interface FinanceLoanDetailResponse {
	loan_application: LoanApplication;
	finance_stage?: LoanWorkflowStage | null;
}

export interface LegalLoanDetailResponse {
	loan_application: LoanApplication;
	legal_stage?: LoanWorkflowStage | null;
}

export interface LoanApplicationListParams {
	status?: LoanApplicationStatus[] | LoanApplicationStatus;
	stage_type?: LoanWorkflowStageType;
	limit?: number;
	offset?: number;
	created_from?: string;
	created_to?: string;
}

export interface LoanApplicationListResponse {
	items: LoanApplicationSummary[];
	total: number;
}

export interface LoanQueueListParams {
	limit?: number;
	offset?: number;
}

export interface LoanQueueListResponse {
	items: LoanApplicationSummary[];
	total: number;
}

export type LoanSpouseInfoFormValues = z.infer<typeof loanSpouseInfoSchema>;
export interface LoanWizardExerciseStepProps {
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	hasSummary: boolean;
	selectionMode: LoanSelectionMode;
	selectionValue: string;
	selectionError: string | null;
	onSelectionModeChange: (mode: LoanSelectionMode) => void;
	onSelectionValueChange: (value: string) => void;
	totalExercisableShares: number;
	totalVestedShares?: number | null;
	totalReservedShares?: number | null;
	totalAvailableVestedShares?: number | null;
	sharesToExercise: number;
	estimatedPurchasePrice: number | null;
}
export interface LoanWizardTermsStepProps {
	policy: SelfOrgPolicy | null | undefined;
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	interestType: LoanInterestType | null;
	repaymentMethod: LoanRepaymentMethod | null;
	termMonths: number | null;
	onInterestTypeChange: (value: LoanInterestType) => void;
	onRepaymentMethodChange: (value: LoanRepaymentMethod) => void;
	onTermMonthsChange: (value: number | null) => void;
	termsError: string | null;
	quote: LoanQuoteResponse | null | undefined;
	quoteOptions: LoanQuoteOption[];
	selectedQuoteIndex: number;
	onSelectQuoteOption: (index: number, option: LoanQuoteOption) => void;
	quoteLoading: boolean;
	quoteError: boolean;
	onRetryQuote: () => void;
}

export type MaritalConfirmation = "yes" | "no" | null;

export interface LoanWizardMaritalStepProps {
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	maritalStatusOnFile: string | null;
	confirmation: MaritalConfirmation;
	onConfirmYes: () => void;
	onConfirmNo: () => void;
	onBackToLoans: () => void;
	errorMessage: string | null;
	isSaving: boolean;
	children?: ReactNode;
}

export interface LoanWizardSpouseFormProps {
	form: UseFormReturn<LoanSpouseInfoFormValues>;
	disabled?: boolean;
	onFieldChange?: () => void;
}

export interface LoanWizardReviewStepProps {
	selectionMode: LoanSelectionMode;
	selectionValue: string;
	sharesToExercise: number;
	asOfDate: string;
	quote: LoanQuoteResponse | null;
	selectedQuoteOption: LoanQuoteOption | null;
	maritalStatus: string | null;
	spouseInfo: LoanSpouseInfoFormValues | null;
	requiresSpouseInfo: boolean;
	submitError: string | null;
	submitErrorSection: ReviewErrorSection;
	onEditStep: (step: "exercise" | "terms" | "marital") => void;
}

export interface LoanWizardDetailRowProps {
	label: string;
	value?: string | null;
}

export interface LoanWizardStepHeaderProps {
	steps: LoanWizardStep[];
	currentStep: LoanWizardStep;
	stepIndex: number;
}

export interface LoanWizardLeaveDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCancel: () => void;
	onConfirm: () => void;
	title?: string;
	description?: string;
	confirmLabel?: string;
}

export interface LoanWizardLayoutProps {
	steps: LoanWizardStep[];
	currentStep: LoanWizardStep;
	stepIndex: number;
	children: ReactNode;
	onBack: () => void;
	onNext: () => void;
	backLabel: string;
	nextLabel: string;
	nextDisabled?: boolean;
	leaveDialog?: LoanWizardLeaveDialogProps;
}
export type ReviewErrorSection = "exercise" | "terms" | "consents" | null;
export interface UseLoanWizardArgs {
	id?: string;
}
export type LoanWizardDraftState = "loading" | "error" | "locked" | "ready";

export interface LoanWizardLeaveDialogState {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onCancel: () => void;
	onConfirm: () => void;
}

export interface LoanWizardLayoutState {
	steps: LoanWizardStep[];
	currentStep: LoanWizardStep;
	stepIndex: number;
	content: ReactNode;
	backLabel: string;
	nextLabel: string;
	nextDisabled: boolean;
	onBack: () => void;
	onNext: () => void;
	leaveDialog: LoanWizardLeaveDialogState;
}

export interface LoanWizardState {
	draftState: LoanWizardDraftState;
	layout?: LoanWizardLayoutState;
	onRetryDraft?: () => void;
	onViewDraft?: () => void;
}
