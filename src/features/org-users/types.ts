export type EmploymentStatus = "active" | "inactive" | "terminated" | "leave";
export type PlatformStatus = "enabled" | "disabled" | "locked";
export type InvitationStatus = "pending" | "accepted" | "expired";

export interface UserSummary {
	id: string;
	email: string;
	fullName: string;
	department?: string | null;
}

export interface OrgMembershipSummary {
	membershipId: string;
	orgId: string;
	user: UserSummary;
	employmentStatus: EmploymentStatus;
	platformStatus: PlatformStatus;
	invitationStatus?: InvitationStatus;
	roles?: string[];
}

export interface OrgUserDetail extends OrgMembershipSummary {
	phoneNumber?: string | null;
	timezone?: string | null;
	employeeId?: string | null;
	employmentStartDate?: string | null;
}

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
