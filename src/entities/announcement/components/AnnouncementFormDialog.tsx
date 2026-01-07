import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/Button";
import type {
	AnnouncementFormDialogProps,
	AnnouncementFormValues,
} from "../types";
import {
	ANNOUNCEMENT_STATUS_LABELS,
	ANNOUNCEMENT_STATUSES,
	ANNOUNCEMENT_TYPE_COLORS,
} from "../constants";
import { announcementFormSchema } from "../schemas";

function toDateTimeLocal(value?: string | null) {
	if (!value) return "";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
		date.getDate()
	)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function AnnouncementFormDialog({
	open,
	onOpenChange,
	initialData,
	onSubmit,
	isSubmitting = false,
}: AnnouncementFormDialogProps) {
	const form = useForm<AnnouncementFormValues>({
		resolver: zodResolver(announcementFormSchema),
		defaultValues: {
			title: initialData?.title ?? "",
			body: initialData?.body ?? "",
			type: initialData?.type ?? "GENERAL",
			status: initialData?.status ?? "DRAFT",
			scheduled_at: initialData?.scheduled_at ?? undefined,
		},
	});

	useEffect(() => {
		form.reset({
			title: initialData?.title ?? "",
			body: initialData?.body ?? "",
			type: initialData?.type ?? "GENERAL",
			status: initialData?.status ?? "DRAFT",
			scheduled_at: initialData?.scheduled_at ?? undefined,
		});
	}, [initialData, form, open]);

	const handleSubmit = (values: AnnouncementFormValues) => onSubmit(values);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>
						{initialData ? "Edit announcement" : "Create announcement"}
					</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(handleSubmit)}>
						<DialogBody className="space-y-4">
							<FormField
								control={form.control}
								name="title"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Title</FormLabel>
										<FormControl>
											<Input
												{...field}
												placeholder="Enter announcement title"
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="body"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Body</FormLabel>
										<FormControl>
											<textarea
												{...field}
												className="flex min-h-[140px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
												placeholder="Add the announcement body"
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<div className="grid gap-4 md:grid-cols-2">
								<FormField
									control={form.control}
									name="type"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Type</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select type" />
													</SelectTrigger>
													<SelectContent>
														{Object.keys(ANNOUNCEMENT_TYPE_COLORS).map(
															(value) => (
																<SelectItem key={value} value={value}>
																	{value.charAt(0) +
																		value.slice(1).toLowerCase()}
																</SelectItem>
															)
														)}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name="status"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Status</FormLabel>
											<FormControl>
												<Select
													value={field.value}
													onValueChange={field.onChange}
												>
													<SelectTrigger>
														<SelectValue placeholder="Select status" />
													</SelectTrigger>
													<SelectContent>
														{ANNOUNCEMENT_STATUSES.map((status) => (
															<SelectItem key={status} value={status}>
																{ANNOUNCEMENT_STATUS_LABELS[status]}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>
							<FormField
								control={form.control}
								name="scheduled_at"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Schedule (optional)</FormLabel>
										<FormControl>
											<Input
												{...field}
												type="datetime-local"
												value={toDateTimeLocal(field.value)}
												onChange={(event) =>
													field.onChange(event.target.value || undefined)
												}
												disabled={isSubmitting}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</DialogBody>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Save"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
