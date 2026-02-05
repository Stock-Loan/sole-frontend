import { z } from "zod";
import type { Role } from "@/entities/role/types";

export const EmploymentStatusSchema = z.enum([
	"ACTIVE",
	"ON_LEAVE",
	"FURLOUGHED",
	"SUSPENDED",
	"PROBATIONARY",
	"TERMINATED",
	"RETIRED",
	"RESIGNED",
	"active",
	"on_leave",
	"furloughed",
	"suspended",
	"probationary",
	"terminated",
	"retired",
	"resigned",
]);

export const PlatformStatusSchema = z.enum([
	"INVITED",
	"ENABLED",
	"DISABLED",
	"LOCKED",
	"ACTIVE",
	"invited",
	"enabled",
	"disabled",
	"locked",
	"active",
]);

export const InvitationStatusSchema = z.enum([
	"PENDING",
	"ACCEPTED",
	"EXPIRED",
	"INVITED",
	"pending",
	"accepted",
	"expired",
	"invited",
]);

export const OrgUserDtoSchema = z.object({
	id: z.string(),
	org_id: z.string(),
	org_name: z.string().optional(),
	email: z.string().email(),
	full_name: z.string().nullable().optional(),
	first_name: z.string().nullable().optional(),
	middle_name: z.string().nullable().optional(),
	last_name: z.string().nullable().optional(),
	preferred_name: z.string().nullable().optional(),
	timezone: z.string().nullable().optional(),
	phone_number: z.string().nullable().optional(),
	marital_status: z.string().nullable().optional(),
	country: z.string().nullable().optional(),
	state: z.string().nullable().optional(),
	address_line1: z.string().nullable().optional(),
	address_line2: z.string().nullable().optional(),
	postal_code: z.string().nullable().optional(),
	is_active: z.boolean().optional(),
	is_superuser: z.boolean().optional(),
	mfa_enabled: z.boolean().optional(),
	created_at: z.string().optional(),
});

export const RoleSummarySchema = z.object({
	id: z.string(),
	name: z.string().optional(),
	is_system_role: z.boolean().optional(),
});

// Define RoleSchema based on the Role interface
export const RoleSchema: z.ZodType<Role> = z.object({
	id: z.string(),
	org_id: z.string().optional(),
	name: z.string(),
	description: z.string().nullable().optional(),
	is_system_role: z.boolean().optional(),
	permissions: z
		.array(z.string())
		.nullish()
		.transform((val) => val ?? []), // Make permissions optional and default to empty array
	created_at: z.string().optional(),
	updated_at: z.string().optional(),
});

export const OrgMembershipDtoSchema = z.object({
	id: z.string(),
	org_id: z.string(),
	user_id: z.string(),
	roles: z.array(z.union([z.string(), RoleSummarySchema])).nullish(),
	employee_id: z.string().nullable().optional(),
	employment_start_date: z.string().nullable().optional(),
	employment_status: EmploymentStatusSchema,
	platform_status: PlatformStatusSchema,
	invitation_status: InvitationStatusSchema.optional(),
	invited_at: z.string().nullable().optional(),
	accepted_at: z.string().nullable().optional(),
	created_at: z.string().nullable().optional(),
	department: z.string().nullable().optional(),
	department_id: z.string().nullable().optional(),
	department_name: z.string().nullable().optional(),
	last_active_at: z.string().nullable().optional(),
	role_ids: z.array(z.string()).nullish(),
});

export const OrgUserListItemSchema = z.object({
	user: OrgUserDtoSchema,
	membership: OrgMembershipDtoSchema,
	roles: z.array(RoleSchema).nullish(),
});

export const OrgUsersListResponseSchema = z.object({
	items: z
		.array(OrgUserListItemSchema)
		.nullish()
		.transform((val) => val ?? []),
	total: z.number().optional(),
	page: z.number().optional(),
	page_size: z.number().optional(),
});

export const OnboardUserResponseSchema = z.object({
	user: OrgUserDtoSchema,
	membership: OrgMembershipDtoSchema,
	user_status: z.enum(["new", "existing"]).optional(),
	membership_status: z.enum(["created", "already_exists"]).optional(),
	temporary_password: z.string().optional(),
});

export const BulkOnboardingRowResultSchema = z.object({
	row: z.number(),
	email: z.string().optional(),
	employee_id: z.string().optional(),
	status: z.enum(["success", "failure"]),
	message: z.string().optional(),
});

export const BulkOnboardingSuccessSchema = z.object({
	row_number: z.number(),
	user: OrgUserDtoSchema.optional(),
	membership: OrgMembershipDtoSchema.optional(),
	user_status: z.enum(["new", "existing"]).optional(),
	membership_status: z.enum(["created", "already_exists"]).optional(),
	email: z.string().optional(),
	first_name: z.string().optional(),
	last_name: z.string().optional(),
	employee_id: z.string().optional(),
	temporary_password: z.string().optional(),
	message: z.string().optional(),
});

export const BulkOnboardingErrorSchema = z.object({
	row_number: z.number(),
	email: z.string().optional(),
	first_name: z.string().optional(),
	last_name: z.string().optional(),
	employee_id: z.string().optional(),
	error: z.string(),
});

export const BulkOnboardingResultSchema = z.object({
	results: z.array(BulkOnboardingRowResultSchema).optional(),
	errors: z.array(BulkOnboardingErrorSchema).optional(),
	successes: z.array(BulkOnboardingSuccessSchema).optional(),
	total_rows: z.number().optional(),
	success_count: z.number().optional(),
	failure_count: z.number().optional(),
});

export const BulkDeleteMembershipsResponseSchema = z.object({
	deleted: z.number(),
	not_found: z.array(z.string()).optional(),
});

export const formSchema = z.object({
	email: z.string().email("Enter a valid email"),
	first_name: z.string().min(1, "First name is required"),
	middle_name: z.string().optional(),
	last_name: z.string().min(1, "Last name is required"),
	preferred_name: z.string().optional(),
	phone_number: z.string().optional(),
	timezone: z.string().optional(),
	marital_status: z.string().min(1, "Select marital status"),
	country: z.string().min(1, "Select a country"),
	state: z.string().min(1, "Select a state"),
	address_line1: z.string().min(1, "Address line 1 is required"),
	address_line2: z.string().optional(),
	postal_code: z.string().min(1, "Postal code is required"),
	employee_id: z.string().optional(),
	employment_start_date: z.string().optional(),
	employment_status: z.enum([
		"ACTIVE",
		"ON_LEAVE",
		"FURLOUGHED",
		"SUSPENDED",
		"PROBATIONARY",
		"TERMINATED",
		"RETIRED",
		"RESIGNED",
	]),
	temporary_password: z.string().optional(),
});

export const profileSchema = z.object({
	email: z.string().email("Enter a valid email"),
	first_name: z.string().min(1, "First name is required"),
	middle_name: z.string().optional(),
	last_name: z.string().min(1, "Last name is required"),
	preferred_name: z.string().optional(),
	timezone: z.string().optional(),
	phone_number: z.string().optional(),
	marital_status: z.string().min(1, "Select marital status"),
	country: z.string().min(1, "Select a country"),
	state: z.string().min(1, "Select a state"),
	address_line1: z.string().min(1, "Address line 1 is required"),
	address_line2: z.string().optional(),
	postal_code: z.string().min(1, "Postal code is required"),
	employee_id: z.string().optional(),
	employment_status: z.enum([
		"ACTIVE",
		"ON_LEAVE",
		"FURLOUGHED",
		"SUSPENDED",
		"PROBATIONARY",
		"TERMINATED",
		"RETIRED",
		"RESIGNED",
	]),
	platform_status: z.enum(["ACTIVE", "INVITED", "SUSPENDED"]),
});
