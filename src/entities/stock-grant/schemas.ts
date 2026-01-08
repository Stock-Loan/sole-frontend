import { z } from "zod";

const vestingEventSchema = z.object({
	vest_date: z.string().min(1, "Vesting date is required"),
	shares: z
		.number()
		.min(1, "Shares must be at least 1")
		.max(1_000_000_000, "Shares are too large"),
});

export const stockGrantFormSchema = z
	.object({
		grant_date: z.string().min(1, "Grant date is required"),
		total_shares: z
			.number()
			.min(1, "Total shares must be at least 1")
			.max(1_000_000_000, "Total shares are too large"),
		exercise_price: z.string().min(1, "Exercise price is required"),
		vesting_strategy: z.enum(["IMMEDIATE", "SCHEDULED"]),
		notes: z.string().optional().nullable(),
		vesting_events: z.array(vestingEventSchema).default([]),
		status: z.enum(["ACTIVE", "CANCELLED", "EXERCISED_OUT"]).default("ACTIVE"),
	})
	.superRefine((values, ctx) => {
		if (values.vesting_strategy !== "SCHEDULED") return;
		if (!values.vesting_events.length) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["vesting_events"],
				message: "Add at least one vesting event.",
			});
			return;
		}

		const totalShares = values.vesting_events.reduce(
			(sum, event) => sum + (event.shares || 0),
			0
		);
		if (totalShares !== values.total_shares) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["vesting_events"],
				message: "Vesting event shares must equal total shares.",
			});
		}

		const grantDate = new Date(values.grant_date);
		if (Number.isNaN(grantDate.getTime())) return;
		values.vesting_events.forEach((event, index) => {
			const eventDate = new Date(event.vest_date);
			if (Number.isNaN(eventDate.getTime())) return;
			if (eventDate < grantDate) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					path: ["vesting_events", index, "vest_date"],
					message: "Vesting date cannot be before the grant date.",
				});
			}
		});
	});
