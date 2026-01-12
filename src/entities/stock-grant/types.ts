// Stock grants & vesting types.
// Permission notes: stock.view for read access; stock.manage for create/edit.
// Stock summary requires stock.vesting.view and stock.eligibility.view.

export type VestingStrategy = "IMMEDIATE" | "SCHEDULED";
export type StockGrantStatus = "ACTIVE" | "CANCELLED" | "EXERCISED_OUT";

export interface VestingEventInput {
	vest_date: string;
	shares: number;
}

export interface VestingEvent extends VestingEventInput {
	id?: string;
}

export interface NextVestingEvent {
	vest_date: string;
	shares: number;
}

export interface StockGrant {
	id: string;
	org_id?: string;
	org_membership_id?: string;
	grant_date: string;
	total_shares: number;
	exercise_price: string;
	status: StockGrantStatus;
	vesting_strategy: VestingStrategy;
	notes?: string | null;
	vesting_events?: VestingEvent[];
	vested_shares?: number;
	unvested_shares?: number;
	reserved_shares?: number;
	available_vested_shares?: number;
	next_vesting_event?: NextVestingEvent | null;
	next_vesting_summary?: string | null;
}

export interface StockGrantListResponse {
	items: StockGrant[];
	total?: number;
}

export interface StockGrantListParams {
	page?: number;
	page_size?: number;
}

export interface StockGrantInput {
	grant_date: string;
	total_shares: number;
	exercise_price: string;
	vesting_strategy: VestingStrategy;
	notes?: string | null;
	vesting_events?: VestingEventInput[];
}

export interface StockGrantUpdateInput {
	status?: StockGrantStatus;
	notes?: string | null;
	vesting_events?: VestingEventInput[];
}

export type EligibilityReasonCode =
	| "EMPLOYMENT_INACTIVE"
	| "INSUFFICIENT_SERVICE_DURATION"
	| "NO_VESTED_SHARES"
	| "BELOW_MIN_VESTED_THRESHOLD";

export interface EligibilityReason {
	code: EligibilityReasonCode;
	message: string;
}

export interface EligibilityResult {
	eligible_to_exercise: boolean;
	total_granted_shares: number;
	total_vested_shares: number;
	total_unvested_shares: number;
	reasons: EligibilityReason[];
}

export interface GrantSummary {
	grant_id: string;
	grant_date: string;
	total_shares: number;
	vested_shares: number;
	unvested_shares: number;
	reserved_shares: number;
	available_vested_shares: number;
	exercise_price: string;
}

export interface StockSummary {
	org_membership_id: string;
	total_granted_shares: number;
	total_vested_shares: number;
	total_unvested_shares: number;
	total_reserved_shares: number;
	total_available_vested_shares: number;
	next_vesting_event?: NextVestingEvent | null;
	eligibility_result: EligibilityResult;
	grants: GrantSummary[];
}

export interface StockSummaryParams {
	as_of?: string;
}

export type StockGrantFormMode = "create" | "edit";

export interface StockGrantFormValues {
	grant_date: string;
	total_shares: number;
	exercise_price: string;
	vesting_strategy: VestingStrategy;
	notes?: string | null;
	vesting_events: VestingEventInput[];
	status: StockGrantStatus;
}

export interface StockGrantDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: StockGrantFormMode;
	initialGrant?: StockGrant | null;
	onSubmit: (values: StockGrantFormValues) => Promise<void>;
	isSubmitting?: boolean;
}

export interface StockGrantsSectionProps {
	membershipId: string;
	canManage: boolean;
	isGrantActionBlocked?: boolean;
}

export interface StockGrantsSectionHandle {
	openCreate: () => void;
}

export type StockAdminTabKey = "summary" | "grants";

export interface StockSummaryMetric {
	label: string;
	value: string;
}
