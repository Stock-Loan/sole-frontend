import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { nonEmptyString } from "@/lib/validation";
import { PERMISSION_CATALOG } from "../constants";
import type { RoleFormProps, RoleFormValues } from "../types";

const schema = z.object({
	name: nonEmptyString.min(1, "Role name is required"),
	description: z.string().optional().nullable(),
	permissions: z.array(z.string()).min(1, "Select at least one permission"),
});

const defaultValues: RoleFormValues = {
	name: "",
	description: "",
	permissions: [],
};

export function RoleForm({
	initialValues,
	onSubmit,
	isSubmitting = false,
	disabled = false,
	formId = "role-form",
}: RoleFormProps) {
	const form = useForm<RoleFormValues>({
		resolver: zodResolver(schema),
		defaultValues,
	});

	useEffect(() => {
		const sanitized = initialValues
			? {
					name: initialValues.name ?? "",
					description: initialValues.description ?? "",
					permissions: initialValues.permissions ?? [],
			  }
			: defaultValues;
		form.reset(sanitized);
	}, [initialValues, form]);

	const handlePermissionChange = (
		current: string[],
		permission: string,
		checked: boolean | "indeterminate"
	) => {
		if (checked) {
			return Array.from(new Set([...current, permission]));
		}
		return current.filter((item) => item !== permission);
	};

	return (
		<Form {...form}>
			<form
				id={formId}
				className="space-y-6"
				onSubmit={form.handleSubmit((values) => onSubmit(values))}
			>
				<div className="grid gap-4 md:grid-cols-2">
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Example: Org Admin"
										disabled={isSubmitting || disabled}
										value={field.value ?? ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="description"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Description</FormLabel>
								<FormControl>
									<Input
										{...field}
										placeholder="Brief summary"
										disabled={isSubmitting || disabled}
										value={field.value ?? ""}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<FormField
					control={form.control}
					name="permissions"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Permissions</FormLabel>
							<div className="grid gap-3 md:grid-cols-2">
								{PERMISSION_CATALOG.map((group) => (
									<div
										key={group.category}
										className="space-y-2 rounded-lg border bg-muted/40 px-3 py-3"
									>
										<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
											{group.category}
										</p>
										<div className="space-y-2">
											{group.codes.map((code) => {
												const checked = field.value?.includes(code);
												return (
													<label
														key={code}
														className="flex items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-muted/60"
													>
														<Checkbox
															checked={checked}
															disabled={isSubmitting || disabled}
															onCheckedChange={(next) =>
																field.onChange(
																	handlePermissionChange(
																		field.value ?? [],
																		code,
																		Boolean(next)
																	)
																)
															}
														/>
														<span className="font-medium text-foreground">
															{code}
														</span>
													</label>
												);
											})}
										</div>
									</div>
								))}
							</div>
							<FormMessage />
						</FormItem>
					)}
				/>
			</form>
		</Form>
	);
}
