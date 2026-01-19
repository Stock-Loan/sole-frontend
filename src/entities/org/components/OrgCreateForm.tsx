import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/shared/ui/input";
import { Form } from "@/shared/ui/Form/form";
import { FormFieldWrapper } from "@/shared/ui/Form/FormField";
import { orgCreateSchema } from "@/entities/org/schemas";
import type { OrgCreatePayload } from "@/entities/org/types";

export interface OrgCreateFormProps {
	isSubmitting?: boolean;
	onSubmit: (values: OrgCreatePayload) => Promise<void> | void;
	formId?: string;
}

export function OrgCreateForm({
	isSubmitting,
	onSubmit,
	formId,
}: OrgCreateFormProps) {
	const form = useForm<OrgCreatePayload>({
		resolver: zodResolver(orgCreateSchema),
		defaultValues: {
			org_id: "",
			name: "",
			slug: "",
		},
	});

	return (
		<Form {...form}>
			<form
				id={formId}
				onSubmit={form.handleSubmit(async (values) => {
					await onSubmit(values);
					form.reset();
				})}
				className="space-y-4"
			>
				<FormFieldWrapper
					name="org_id"
					control={form.control}
					label="Org ID"
					description="Unique org identifier (e.g., acme)."
				>
					{({ field }) => <Input placeholder="acme" {...field} />}
				</FormFieldWrapper>
				<FormFieldWrapper
					name="name"
					control={form.control}
					label="Organization name"
				>
					{({ field }) => <Input placeholder="Acme Corporation" {...field} />}
				</FormFieldWrapper>
				<FormFieldWrapper
					name="slug"
					control={form.control}
					label="Slug"
					description="URL-friendly slug (e.g., acme)."
				>
					{({ field }) => <Input placeholder="acme" {...field} />}
				</FormFieldWrapper>
				<input type="submit" className="hidden" disabled={isSubmitting} />
			</form>
		</Form>
	);
}
