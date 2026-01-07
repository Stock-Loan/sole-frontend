import type { formSchema, profileSchema } from "@/entities/user/schemas";
import { z } from "zod";
import type { Role } from "@/entities/role/types";

export type EmploymentStatus =
	| "ACTIVE"
	| "ON_LEAVE"
	| "FURLOUGHED"
	| "SUSPENDED"
	| "PROBATIONARY"
	| "TERMINATED"
	| "RETIRED"
	| "RESIGNED"
	| "active"
	| "on_leave"
	| "furloughed"
	| "suspended"
	| "probationary"
	| "terminated"
	| "retired"
	| "resigned";
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
	org_name?: string;
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
	roles?: Array<string | RoleSummary> | null;
	department_id?: string | null;
	department_name?: string | null;
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
	role_ids?: string[] | null;
}
export interface RoleSummary {
	id: string;
	name?: string;
	is_system_role?: boolean;
}

export interface OrgUserListItem {
	user: OrgUserDto;
	membership: OrgMembershipDto;
	roles?: Role[] | null;
}

export interface OrgUsersListParams {
	search?: string;
	employment_status?: EmploymentStatus;
	platform_status?: PlatformStatus;
	invitation_status?: InvitationStatus;
	role_id?: string;
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
	temporary_password?: string;
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

export type OrgUserDetailTabKey = "info" | "grants";

export interface BulkOnboardingRowResult {
	row: number;
	email?: string;
	employee_id?: string;
	status: BulkOnboardingRowStatus;
	message?: string;
}

export interface BulkOnboardingSuccessItem {
	row_number: number;
	user?: OrgUserDto;
	membership?: OrgMembershipDto;
	email?: string;
	first_name?: string;
	last_name?: string;
	employee_id?: string;
	temporary_password?: string;
	message?: string;
}

export interface BulkOnboardingErrorItem {
	row_number: number;
	email?: string;
	first_name?: string;
	last_name?: string;
	employee_id?: string;
	error: string;
}

export interface BulkOnboardingResult {
	results?: BulkOnboardingRowResult[];
	errors?: BulkOnboardingErrorItem[];
	successes?: BulkOnboardingSuccessItem[];
	total_rows?: number;
	success_count?: number;
	failure_count?: number;
}

export interface BulkDeleteMembershipsResponse {
	deleted: number;
	not_found?: string[];
}
export interface BulkUploadPreviewProps {
	headers: string[];
	rows: string[][];
	fileName?: string;
}
export interface BulkUploadPreviewRow {
	id: string;
	rowNumber: number;
	values: string[];
}
export interface AddUserDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSubmit: (values: OnboardUserPayload) => Promise<void>;
	trigger: React.ReactNode;
}
export type AddUserFormValues = z.infer<typeof formSchema>;
export type ProfileFormValues = z.infer<typeof profileSchema>;
export interface OrgUserProfileDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	user: OrgUserListItem | null;
	membershipId: string | null;
	onUpdated: () => void;
}

export interface OrgUserInfoRowProps {
	label: string;
	value?: string | null;
}
export interface OrgUserInfoGridProps {
	items: OrgUserInfoRowProps[];
}
export interface BulkOnboardingGuideProps {
	className?: string;
}
export interface BulkOnboardingResultsTableProps {
	successes: BulkOnboardingSuccessItem[];
	errors: BulkOnboardingErrorItem[];
}
export interface DepartmentOption {
	id: string;
	name: string;
	is_archived?: boolean;
}
export interface OrgUserSidePanelProps {
	membershipId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdated?: () => void;
}
