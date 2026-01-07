import { z } from "zod";

export const orgSettingsSchema = z
	.object({
		allow_user_data_export: z.boolean(),
		allow_profile_edit: z.boolean(),
		require_two_factor: z.boolean(),
		audit_log_retention_days: z
			.number()
			.min(30, "Minimum 30 days")
			.max(3650, "Maximum 3650 days"),
		inactive_user_retention_days: z
			.number()
			.min(30, "Minimum 30 days")
			.max(3650, "Maximum 3650 days"),
		enforce_service_duration_rule: z.boolean(),
		min_service_duration_days: z
			.number()
			.min(0, "Minimum 0 days")
			.max(36500, "Maximum 36500 days")
			.nullable(),
		enforce_min_vested_to_exercise: z.boolean(),
		min_vested_shares_to_exercise: z
			.number()
			.min(0, "Minimum 0 shares")
			.max(1_000_000_000, "Maximum 1,000,000,000 shares")
			.nullable(),
	})
	.superRefine((values, ctx) => {
		if (
			values.enforce_service_duration_rule &&
			values.min_service_duration_days === null
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["min_service_duration_days"],
				message: "Service duration is required when the rule is enabled.",
			});
		}
		if (
			values.enforce_min_vested_to_exercise &&
			values.min_vested_shares_to_exercise === null
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["min_vested_shares_to_exercise"],
				message: "Minimum vested shares is required when the rule is enabled.",
			});
		}
	});
