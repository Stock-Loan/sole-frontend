import { z } from "zod";
import { nonEmptyString } from "@/shared/lib/validators";

export const roleFormSchema = z.object({
	name: nonEmptyString.min(1, "Role name is required"),
	description: z.string().optional().nullable(),
	permissions: z.array(z.string()).min(1, "Select at least one permission"),
});
