import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { DepartmentFormDialogProps } from "../types";

const departmentSchema = z.object({
	name: z.string().min(1, "Name is required"),
	code: z.string().min(1, "Code is required"),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;

export function DepartmentFormDialog({
	open,
	onOpenChange,
	mode,
	initialDepartment,
	onSubmit,
	isSubmitting,
}: DepartmentFormDialogProps) {
	const form = useForm<DepartmentFormValues>({
		resolver: zodResolver(departmentSchema),
		defaultValues: {
			name: "",
			code: "",
		},
	});

	useEffect(() => {
		if (initialDepartment && open) {
			form.reset({
				name: initialDepartment.name || "",
				code: initialDepartment.code || "",
			});
		} else if (open && !initialDepartment) {
			form.reset({ name: "", code: "" });
		}
	}, [form, initialDepartment, open]);

	const handleSubmit = (values: DepartmentFormValues) => {
		onSubmit(values, initialDepartment?.id);
	};

	const title = mode === "edit" ? "Edit department" : "New department";
	const description =
		mode === "edit"
			? "Update department details."
			: "Create a new department for this organization.";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<p className="text-sm text-muted-foreground">{description}</p>
				</DialogHeader>
				<DialogBody>
					<Form {...form}>
						<form
							id="department-form"
							className="space-y-4"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input placeholder="e.g. Engineering" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Code</FormLabel>
										<FormControl>
											<Input placeholder="e.g. ENG" {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</form>
					</Form>
				</DialogBody>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						type="submit"
						form="department-form"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
