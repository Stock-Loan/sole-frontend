import { z } from "zod";
import type { Role } from "@/features/roles/types";

export const EmploymentStatusSchema = z.enum([
	"ACTIVE",
	"INACTIVE",
	"TERMINATED",
	"LEAVE",
	"active",
	"inactive",
	"terminated",
	"leave",
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
	permissions: z.array(z.string()).nullish().transform(val => val ?? []), // Make permissions optional and default to empty array
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
	items: z.array(OrgUserListItemSchema).nullish().transform(val => val ?? []),
	total: z.number().optional(),
	page: z.number().optional(),
	page_size: z.number().optional(),
});

export const OnboardUserResponseSchema = z.object({
	user: OrgUserDtoSchema,
	membership: OrgMembershipDtoSchema,
	temporary_password: z.string().optional(),
});

export const BulkOnboardingRowResultSchema = z.object({
	row: z.number(),
	email: z.string().optional(),
	employee_id: z.string().optional(),
	status: z.enum(["success", "failure"]),
	message: z.string().optional(),
});

export const BulkOnboardingResultSchema = z.object({
	results: z.array(BulkOnboardingRowResultSchema).optional(),
	errors: z
		.array(
			z.object({
				row_number: z.number(),
				email: z.string().optional(),
				employee_id: z.string().optional(),
				error: z.string(),
			}),
		)
		.optional(),
	successes: z
		.array(
			z.object({
				row_number: z.number(),
				email: z.string().optional(),
				employee_id: z.string().optional(),
				message: z.string().optional(),
			}),
		)
		.optional(),
	total_rows: z.number(),
	success_count: z.number(),
	failure_count: z.number(),
});

export const BulkDeleteMembershipsResponseSchema = z.object({
	deleted: z.number(),
	not_found: z.array(z.string()).optional(),
});
