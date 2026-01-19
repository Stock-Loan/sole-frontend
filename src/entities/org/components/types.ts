import type { OrgCreatePayload } from "@/entities/org/types";

export interface OrgCreateFormProps {
	isSubmitting?: boolean;
	onSubmit: (values: OrgCreatePayload) => Promise<void> | void;
	formId?: string;
}
