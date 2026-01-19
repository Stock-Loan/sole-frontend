import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/input";
import { Form } from "@/shared/ui/Form/form";
import { FormFieldWrapper } from "@/shared/ui/Form/FormField";
import { orgCreateSchema } from "@/entities/org/schemas";
import type { OrgCreatePayload } from "@/entities/org/types";

export interface OrgCreateFormProps {
	isSubmitting?: boolean;
	onSubmit: (values: OrgCreatePayload) => Promise<void> | void;
}

export function OrgCreateForm({ isSubmitting, onSubmit }: OrgCreateFormProps) {
	const form = useForm<OrgCreatePayload>({
		resolver: zodResolver(orgCreateSchema),
		defaultValues: {
			org_id: "",
			name: "",
			slug: "",
		},
	});

	return (
		<Card>
			<CardHeader>
				<CardTitle className="text-sm font-semibold">
					Create organization
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form {...form}>
					<form
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
							{({ field }) => (
								<Input placeholder="acme" {...field} />
							)}
						</FormFieldWrapper>
						<FormFieldWrapper
							name="name"
							control={form.control}
							label="Organization name"
						>
							{({ field }) => (
								<Input placeholder="Acme Corporation" {...field} />
							)}
						</FormFieldWrapper>
						<FormFieldWrapper
							name="slug"
							control={form.control}
							label="Slug"
							description="URL-friendly slug (e.g., acme)."
						>
							{({ field }) => (
								<Input placeholder="acme" {...field} />
							)}
						</FormFieldWrapper>
						<div className="flex justify-end">
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Creating..." : "Create org"}
							</Button>
						</div>
					</form>
				</Form>
			</CardContent>
		</Card>
	);
}
