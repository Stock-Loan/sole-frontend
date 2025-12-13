export type EmploymentStatus =
	| "ACTIVE"
	| "INACTIVE"
	| "TERMINATED"
	| "LEAVE"
	| "active"
	| "inactive"
	| "terminated"
	| "leave";
export type PlatformStatus =
	| "INVITED"
	| "ENABLED"
	| "DISABLED"
	| "LOCKED"
	| "ACTIVE"
	| "invited"
	| "enabled"
	| "disabled"
	| "locked"
	| "active";
export type InvitationStatus =
	| "PENDING"
	| "ACCEPTED"
	| "EXPIRED"
	| "INVITED"
	| "pending"
	| "accepted"
	| "expired"
	| "invited";

export interface OrgUserDto {
	id: string;
	org_id: string;
	email: string;
	full_name?: string | null;
	first_name?: string | null;
	middle_name?: string | null;
	last_name?: string | null;
	preferred_name?: string | null;
	timezone?: string | null;
	phone_number?: string | null;
	marital_status?: string | null;
	country?: string | null;
	state?: string | null;
	address_line1?: string | null;
	address_line2?: string | null;
	postal_code?: string | null;
	is_active?: boolean;
	is_superuser?: boolean;
	created_at?: string;
}

export interface OrgMembershipDto {
	id: string;
	org_id: string;
	user_id: string;
	employee_id?: string | null;
	employment_start_date?: string | null;
	employment_status: EmploymentStatus;
	platform_status: PlatformStatus;
	invitation_status?: InvitationStatus;
	invited_at?: string | null;
	accepted_at?: string | null;
	created_at?: string | null;
	department?: string | null;
	last_active_at?: string | null;
	roles?: string[];
}

export interface OrgUserListItem {
	user: OrgUserDto;
	membership: OrgMembershipDto;
}

export interface OrgUsersListParams {
	search?: string;
	employment_status?: EmploymentStatus;
	platform_status?: PlatformStatus;
	invitation_status?: InvitationStatus;
	page?: number;
	page_size?: number;
}

export interface OrgUsersListResponse {
	items: OrgUserListItem[];
	total?: number;
	page?: number;
	page_size?: number;
}

export interface UpdateOrgUserStatusPayload {
	employment_status?: EmploymentStatus;
	platform_status?: PlatformStatus;
}

export interface OnboardUserPayload {
	email: string;
	first_name: string;
	last_name: string;
	middle_name?: string;
	preferred_name?: string;
	timezone?: string;
	phone_number?: string;
	marital_status?: string;
	country?: string;
	state?: string;
	address_line1?: string;
	address_line2?: string;
	postal_code?: string;
	employee_id?: string;
	employment_start_date?: string;
	employment_status?: EmploymentStatus;
}

export interface OnboardUserResponse {
	user: OrgUserDto;
	membership: OrgMembershipDto;
	temporary_password?: string;
}

export interface UpdateOrgUserProfilePayload {
	email?: string;
	first_name?: string;
	middle_name?: string;
	last_name?: string;
	preferred_name?: string;
	timezone?: string;
	phone_number?: string;
	marital_status?: string;
	country?: string;
	state?: string;
	address_line1?: string;
	address_line2?: string;
	postal_code?: string;
	employee_id?: string;
}

export type BulkOnboardingRowStatus = "success" | "failure";

export interface BulkOnboardingRowResult {
	row: number;
	email?: string;
	employee_id?: string;
	status: BulkOnboardingRowStatus;
	message?: string;
}

export interface BulkOnboardingResult {
	results?: BulkOnboardingRowResult[];
	errors?: Array<{
		row_number: number;
		email?: string;
		employee_id?: string;
		error: string;
	}>;
	successes?: Array<{
		row_number: number;
		email?: string;
		employee_id?: string;
		message?: string;
	}>;
	total_rows: number;
	success_count: number;
	failure_count: number;
}
