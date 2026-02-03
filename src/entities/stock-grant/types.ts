import type { OrgUserListItem } from "@/entities/user/types";

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

export interface VestingEventRow {
	id: string;
	grantId: string;
	grantDate: string;
	status: StockGrantStatus;
	vestDate: string;
	shares: number;
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
	next_vesting_events?: NextVestingEvent[] | null;
	eligibility_result: EligibilityResult;
	grants: GrantSummary[];
}

export interface StockSummaryParams {
	as_of?: string;
}

export interface StockDashboardTotals {
	program_employees: number;
	grant_count: number;
	total_granted_shares: number;
	total_vested_shares: number;
	total_unvested_shares: number;
	total_reserved_shares: number;
	total_available_vested_shares: number;
}

export interface StockDashboardEligibility {
	eligible_to_exercise_count: number;
	not_eligible_due_to_service_count: number;
	not_eligible_due_to_min_vested_count: number;
	not_eligible_due_to_other_count: number;
}

export interface StockDashboardVestingEvent {
	vest_date: string;
	shares: number;
}

export interface StockDashboardVestingTimeline {
	next_vesting_date?: string | null;
	next_vesting_shares?: number | null;
	upcoming_events: StockDashboardVestingEvent[];
}

export interface StockDashboardGrantMix {
	by_status: Record<StockGrantStatus, number>;
	by_vesting_strategy: Record<VestingStrategy, number>;
}

export interface StockDashboardExercisePriceRange {
	min?: string | null;
	max?: string | null;
}

export interface StockDashboardReservationPressure {
	reserved_share_percent_of_vested: string;
	reserved_by_status: Record<string, number>;
}

export interface StockDashboardMembershipSnapshot {
	by_platform_status: Record<string, number>;
	by_employment_status: Record<string, number>;
}

export interface StockDashboardSummary {
	org_id: string;
	as_of: string;
	totals: StockDashboardTotals;
	eligibility: StockDashboardEligibility;
	vesting_timeline: StockDashboardVestingTimeline;
	grant_mix: StockDashboardGrantMix;
	exercise_price_range: StockDashboardExercisePriceRange;
	reservation_pressure: StockDashboardReservationPressure;
	membership_snapshot: StockDashboardMembershipSnapshot;
}

export interface StockDashboardSummaryParams {
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

export interface StockGrantDetailItem {
	label: string;
	value: string;
}

export interface StockGrantDetailGridProps {
	items: StockGrantDetailItem[];
}

export interface StockGrantDetailProps {
	grant: StockGrant | null;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	showOrgFields?: boolean;
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
	helper?: string;
}

export interface StockSearchContextValue {
	searchValue: string;
	setSearchValue: (value: string) => void;
	selectedUser: OrgUserListItem | null;
	setSelectedUser: (user: OrgUserListItem | null) => void;
	isSearchOpen: boolean;
	setIsSearchOpen: (open: boolean) => void;
}
