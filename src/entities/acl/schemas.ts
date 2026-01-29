import { z } from "zod";
import { nonEmptyString } from "@/shared/lib/validators";

export const aclAssignmentSchema = z.object({
	user_id: nonEmptyString,
	permissions: z
		.array(nonEmptyString)
		.min(1, "Select at least one permission"),
	effect: z.enum(["allow", "deny"]),
	expires_at: z.string().optional().nullable(),
});
