import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/shared/ui/Form/form";
import {
	orgDocumentFolderSchema,
	type OrgDocumentFolderValues,
} from "@/entities/document/schemas";
import type { OrgDocumentFolderDialogProps } from "@/entities/document/components/types";

export function OrgDocumentFolderDialog({
	open,
	onOpenChange,
	mode,
	initialValues,
	onSubmit,
	isSubmitting,
}: OrgDocumentFolderDialogProps) {
	const form = useForm<OrgDocumentFolderValues>({
		resolver: zodResolver(orgDocumentFolderSchema),
		defaultValues: initialValues ?? { name: "" },
	});

	useEffect(() => {
		if (!open) return;
		form.reset(initialValues ?? { name: "" });
	}, [form, initialValues, open]);

	const title = mode === "create" ? "New folder" : "Rename folder";
	const description =
		mode === "create"
			? "Create a custom folder to organize templates."
			: "Update the folder name.";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>{description}</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (values) => {
							await onSubmit(values);
						})}
						id="org-document-folder-form"
					>
						<DialogBody className="space-y-4">
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Folder name</FormLabel>
										<FormControl>
											<Input {...field} placeholder="e.g. Compensation" />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</DialogBody>
					</form>
				</Form>
				<DialogFooter>
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
					>
						Cancel
					</Button>
					<Button
						type="submit"
						form="org-document-folder-form"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Saving..." : "Save"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
