import type { DecimalValue, LoanInterestType, LoanRepaymentMethod } from "@/entities/org/types";
import type {
	LoanApplicationStatus,
	LoanWorkflowStageStatus,
} from "@/entities/loan/types";
import type { StockGrantStatus, VestingStrategy } from "@/entities/stock-grant/types";

export interface DashboardPendingAction {
	action_type: string;
	label: string;
	due_date?: string | null;
	related_id?: string | null;
}

export interface DashboardAttentionSummary {
	unread_announcements_count: number;
	pending_actions_count: number;
	pending_actions: DashboardPendingAction[];
}

export interface DashboardStockTotals {
	grant_count: number;
	total_granted_shares: number;
	total_vested_shares: number;
	total_unvested_shares: number;
	total_reserved_shares: number;
	total_available_vested_shares: number;
	exercise_price_min?: DecimalValue;
	exercise_price_max?: DecimalValue;
	weighted_avg_exercise_price?: DecimalValue;
}

export interface DashboardEligibilityReason {
	code: string;
	message: string;
}

export interface DashboardStockEligibility {
	eligible_to_exercise: boolean;
	total_granted_shares: number;
	total_vested_shares: number;
	total_unvested_shares: number;
	reasons: DashboardEligibilityReason[];
}

export interface DashboardVestingEvent {
	vest_date: string;
	shares: number;
}

export interface DashboardVestedByMonth {
	month: string;
	shares: number;
}

export interface DashboardVestingTimeline {
	next_vesting_date?: string | null;
	next_vesting_shares?: number | null;
	upcoming_events: DashboardVestingEvent[];
	vested_by_month: DashboardVestedByMonth[];
}

export interface DashboardGrantMix {
	by_status: Record<StockGrantStatus, number>;
	by_vesting_strategy: Record<VestingStrategy, number>;
}

export interface DashboardReservation {
	reservation_id: string;
	loan_application_id: string;
	grant_id: string;
	shares_reserved: number;
	status: string;
	created_at: string;
}

export interface DashboardReservationsSummary {
	reserved_share_percent_of_vested?: DecimalValue;
	reserved_by_status: Record<string, number>;
	reservations_active: DashboardReservation[];
}

export interface DashboardGrantSummary {
	grant_id: string;
	grant_date: string;
	total_shares: number;
	vested_shares: number;
	unvested_shares: number;
	reserved_shares: number;
	available_vested_shares: number;
	exercise_price: string;
	vesting_strategy: VestingStrategy;
	status: StockGrantStatus;
	next_vesting_date?: string | null;
	next_vesting_shares?: number | null;
}

export interface DashboardPolicySnapshot {
	min_vested_shares_to_exercise?: number | null;
	enforce_min_vested_to_exercise?: boolean;
	min_service_duration_years?: DecimalValue;
	enforce_service_duration_rule?: boolean;
}

export interface DashboardLoanSummary {
	total_loan_applications: number;
	active_loans_count: number;
	completed_loans_count: number;
	pending_loans_count: number;
	active_loan_id?: string | null;
	status?: LoanApplicationStatus | null;
	principal?: DecimalValue;
	estimated_monthly_payment?: DecimalValue;
	total_payable?: DecimalValue;
	total_paid?: DecimalValue;
	total_interest_paid?: DecimalValue;
	remaining_balance?: DecimalValue;
	next_payment_date?: string | null;
	next_payment_amount?: DecimalValue;
	current_stage_type?: string | null;
	current_stage_status?: LoanWorkflowStageStatus | null;
	has_share_certificate?: boolean;
	has_83b_election?: boolean;
	days_until_83b_due?: number | null;
	interest_type?: LoanInterestType | null;
	repayment_method?: LoanRepaymentMethod | null;
}

export interface DashboardRepaymentActivity {
	last_payment_date?: string | null;
	last_payment_amount?: DecimalValue;
	repayment_history: { payment_date: string; amount: DecimalValue }[];
}

export interface MeDashboardSummary {
	as_of_date: string;
	attention: DashboardAttentionSummary;
	stock_totals: DashboardStockTotals;
	stock_eligibility: DashboardStockEligibility;
	vesting_timeline: DashboardVestingTimeline;
	grant_mix: DashboardGrantMix;
	reservations: DashboardReservationsSummary;
	grants: DashboardGrantSummary[];
	grants_total: number;
	policy_snapshot: DashboardPolicySnapshot;
	loan_summary: DashboardLoanSummary;
	repayment_activity: DashboardRepaymentActivity;
}

export interface MeDashboardSummaryParams {
	as_of?: string;
}
