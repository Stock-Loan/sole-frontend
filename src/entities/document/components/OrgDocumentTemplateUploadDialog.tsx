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
import { Textarea } from "@/shared/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { PickDocument } from "@/shared/ui/PickDocument";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import {
	orgDocumentTemplateUploadSchema,
	type OrgDocumentTemplateUploadValues,
} from "@/entities/document/schemas";
import type { OrgDocumentTemplateUploadDialogProps } from "@/entities/document/components/types";

export function OrgDocumentTemplateUploadDialog({
	open,
	onOpenChange,
	folders,
	onSubmit,
	isSubmitting,
	defaultFolderId,
}: OrgDocumentTemplateUploadDialogProps) {
	const form = useForm<OrgDocumentTemplateUploadValues>({
		resolver: zodResolver(orgDocumentTemplateUploadSchema),
		defaultValues: {
			file: null,
			folder_id: defaultFolderId ?? null,
			name: "",
			description: "",
		},
	});

	useEffect(() => {
		if (!open) return;
		form.reset({
			file: null,
			folder_id: defaultFolderId ?? null,
			name: "",
			description: "",
		});
	}, [defaultFolderId, form, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>Upload template</DialogTitle>
					<DialogDescription>
						Add a new document template to the org library.
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (values) => {
							await onSubmit(values);
						})}
						id="org-document-template-form"
					>
						<DialogBody className="space-y-4">
							<FormField
								control={form.control}
								name="file"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Template file</FormLabel>
										<FormControl>
											<PickDocument
												file={field.value ?? null}
												onFileChange={(file) => field.onChange(file)}
												label="Pick a template file"
												helperText="PDF, DOCX, or other business documents."
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="folder_id"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Folder</FormLabel>
										<Select
											value={field.value ?? "none"}
											onValueChange={(value) =>
												field.onChange(value === "none" ? null : value)
											}
										>
											<FormControl>
												<SelectTrigger>
													<SelectValue placeholder="Select a folder" />
												</SelectTrigger>
											</FormControl>
											<SelectContent>
												<SelectItem value="none">General</SelectItem>
												{folders.map((folder) => (
													<SelectItem key={folder.id} value={folder.id}>
														{folder.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Name</FormLabel>
										<FormControl>
											<Input
												{...field}
												value={field.value ?? ""}
												placeholder="Optional display name"
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
											<Textarea
												{...field}
												value={field.value ?? ""}
												placeholder="Optional description"
												className="min-h-[80px]"
											/>
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
						form="org-document-template-form"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Uploading..." : "Upload template"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
