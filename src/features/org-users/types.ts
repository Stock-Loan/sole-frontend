export type EmploymentStatus = "active" | "inactive" | "terminated" | "leave";
export type PlatformStatus = "enabled" | "disabled" | "locked";
export type InvitationStatus = "pending" | "accepted" | "expired";

export interface UserSummary {
	id: string;
	email: string;
	fullName: string;
	firstName?: string | null;
	lastName?: string | null;
}

export interface OrgMembershipSummary {
	membershipId: string;
	orgId: string;
	user: UserSummary;
	department?: string | null;
	employmentStatus: EmploymentStatus;
	platformStatus: PlatformStatus;
	invitationStatus?: InvitationStatus;
	lastActiveAt?: string | null;
	roles?: string[];
}

export interface OrgUserDetail extends OrgMembershipSummary {
	phoneNumber?: string | null;
	timezone?: string | null;
	employeeId?: string | null;
	employmentStartDate?: string | null;
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
	items: OrgMembershipSummary[];
	total: number;
	page: number;
	page_size: number;
}

export interface UpdateOrgUserStatusPayload {
	employment_status?: EmploymentStatus;
	platform_status?: PlatformStatus;
}

// PermissionCode-driven UI will later decide which actions to render (e.g., user.manage).

export interface OnboardUserPayload {
	email: string;
	firstName: string;
	lastName: string;
	timezone?: string;
	phoneNumber?: string;
	employeeId?: string;
	employmentStartDate?: string;
	employmentStatus?: EmploymentStatus;
}

export interface OnboardUserResponse {
	membershipId: string;
	userId: string;
	email: string;
}

export type BulkOnboardingRowStatus = "success" | "failure";

export interface BulkOnboardingRowResult {
	row: number;
	email?: string;
	status: BulkOnboardingRowStatus;
	message?: string;
}

export interface BulkOnboardingResult {
	results: BulkOnboardingRowResult[];
	total_rows: number;
	success_count: number;
	failure_count: number;
}
