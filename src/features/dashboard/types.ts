export interface StockDashboardSummary {
	org_id: string;
	total_program_employees: number;
	total_granted_shares: number;
	total_vested_shares: number;
	total_unvested_shares: number;
	eligible_to_exercise_count: number;
	not_eligible_due_to_service_count: number;
	not_eligible_due_to_min_vested_count: number;
	not_eligible_due_to_other_count?: number;
	next_global_vesting_date?: string | null;
}

export interface StockDashboardSummaryParams {
	as_of?: string;
}
