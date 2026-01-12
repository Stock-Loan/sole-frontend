import { z } from "zod";
import { nonEmptyString } from "@/shared/lib/validators";

export const loanSpouseInfoSchema = z.object({
	spouse_first_name: nonEmptyString,
	spouse_last_name: nonEmptyString,
	spouse_email: z.string().trim().email("Enter a valid email address"),
	spouse_phone: z
		.string()
		.trim()
		.min(7, "Enter a valid phone number"),
	spouse_address: nonEmptyString,
});
