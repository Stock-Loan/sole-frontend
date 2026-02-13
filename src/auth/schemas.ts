import { z } from "zod";
import { nonEmptyString } from "@/shared/lib/validators";
import {
	isPasswordPolicySatisfied,
	PASSWORD_POLICY_ERROR_MESSAGE,
	PASSWORD_MIN_LENGTH,
} from "@/shared/lib/password-policy";

export const credentialsSchema = z.object({
	email: z.string().email("Enter a valid email").toLowerCase(),
	password: nonEmptyString.min(8, "Password must be at least 8 characters"),
});

export const emailSchema = z.object({
	email: z.string().email("Enter a valid email").toLowerCase(),
});

export const passwordSchema = z.object({
	password: nonEmptyString
		.min(
			PASSWORD_MIN_LENGTH,
			`Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
		)
		.refine((value) => isPasswordPolicySatisfied(value), {
			message: PASSWORD_POLICY_ERROR_MESSAGE,
		}),
});

export const mfaCodeSchema = z.object({
	code: z
		.string()
		.regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator"),
	remember_device: z.boolean().default(false),
});

export const changePasswordSchema = z
	.object({
		current_password: nonEmptyString.min(8, "Current password required"),
		new_password: nonEmptyString
			.min(
				PASSWORD_MIN_LENGTH,
				`New password must be at least ${PASSWORD_MIN_LENGTH} characters`,
			)
			.refine((value) => isPasswordPolicySatisfied(value), {
				message: PASSWORD_POLICY_ERROR_MESSAGE,
			}),
		confirm_password: nonEmptyString.min(8, "Confirm your new password"),
	})
	.refine((vals) => vals.new_password === vals.confirm_password, {
		path: ["confirm_password"],
		message: "Passwords do not match",
	});
