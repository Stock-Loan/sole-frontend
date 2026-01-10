import { z } from "zod";

const repaymentMethodsSchema = z.array(
	z.enum(["INTEREST_ONLY", "BALLOON", "PRINCIPAL_AND_INTEREST"])
);
const interestTypesSchema = z.array(z.enum(["FIXED", "VARIABLE"]));

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
		min_service_duration_years: z
			.number()
			.min(0, "Minimum 0 years")
			.max(100, "Maximum 100 years")
			.nullable(),
		enforce_min_vested_to_exercise: z.boolean(),
		min_vested_shares_to_exercise: z
			.number()
			.min(0, "Minimum 0 shares")
			.max(1_000_000_000, "Maximum 1,000,000,000 shares")
			.nullable(),
		allowed_repayment_methods: repaymentMethodsSchema.min(
			1,
			"Select at least one repayment method."
		),
		allowed_interest_types: interestTypesSchema.min(
			1,
			"Select at least one interest type."
		),
		min_loan_term_months: z
			.number()
			.min(1, "Minimum 1 month")
			.max(360, "Maximum 360 months"),
		max_loan_term_months: z
			.number()
			.min(1, "Minimum 1 month")
			.max(360, "Maximum 360 months"),
		fixed_interest_rate_annual_percent: z.number().min(0).nullable(),
		variable_base_rate_annual_percent: z.number().min(0).nullable(),
		variable_margin_annual_percent: z.number().min(0).nullable(),
		require_down_payment: z.boolean(),
		down_payment_percent: z.number().min(0).nullable(),
	})
	.superRefine((values, ctx) => {
		if (
			values.enforce_service_duration_rule &&
			values.min_service_duration_years === null
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["min_service_duration_years"],
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
		if (values.min_loan_term_months > values.max_loan_term_months) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["max_loan_term_months"],
				message: "Maximum term must be greater than or equal to minimum term.",
			});
		}
		if (values.require_down_payment) {
			const downPayment = values.down_payment_percent ?? 0;
			if (!Number.isFinite(downPayment) || downPayment <= 0) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["down_payment_percent"],
					message: "Down payment percent must be greater than 0.",
				});
			}
		}
	});
