import { useEffect } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { stockGrantFormSchema } from "../schemas";
import type {
	StockGrantDialogProps,
	StockGrantFormValues,
	VestingEventInput,
} from "../types";

const defaultValues: StockGrantFormValues = {
	grant_date: "",
	total_shares: 0,
	exercise_price: "",
	vesting_strategy: "IMMEDIATE",
	notes: "",
	vesting_events: [],
	status: "ACTIVE",
};

export function StockGrantDialog({
	open,
	onOpenChange,
	mode,
	initialGrant,
	onSubmit,
	isSubmitting = false,
}: StockGrantDialogProps) {
	const form = useForm<StockGrantFormValues>({
		resolver: zodResolver(stockGrantFormSchema),
		defaultValues,
	});

	const { fields, append, remove, replace } = useFieldArray({
		control: form.control,
		name: "vesting_events",
	});

	const vestingStrategy = useWatch({
		control: form.control,
		name: "vesting_strategy",
	});

	useEffect(() => {
		if (!open) return;
		if (!initialGrant) {
			form.reset(defaultValues);
			return;
		}
		const vestingEvents: VestingEventInput[] =
			initialGrant.vesting_events?.map((event) => ({
				vest_date: event.vest_date,
				shares: event.shares,
			})) ?? [];
		form.reset({
			grant_date: initialGrant.grant_date ?? "",
			total_shares: initialGrant.total_shares ?? 0,
			exercise_price: initialGrant.exercise_price ?? "",
			vesting_strategy: initialGrant.vesting_strategy ?? "IMMEDIATE",
			notes: initialGrant.notes ?? "",
			vesting_events: vestingEvents,
			status: initialGrant.status ?? "ACTIVE",
		});
	}, [form, initialGrant, open]);

	useEffect(() => {
		if (vestingStrategy === "SCHEDULED" && fields.length === 0) {
			append({ vest_date: "", shares: 0 });
		}
		if (vestingStrategy === "IMMEDIATE" && fields.length > 0) {
			replace([]);
		}
	}, [append, fields.length, replace, vestingStrategy]);

	const handleSubmit = async (values: StockGrantFormValues) => {
		await onSubmit(values);
	};

	const errors = form.formState.errors;
	const showScheduledFields = vestingStrategy === "SCHEDULED";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="lg">
				<DialogHeader>
					<DialogTitle>
						{mode === "edit" ? "Edit stock grant" : "New stock grant"}
					</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<Form {...form}>
						<form
							id="stock-grant-form"
							className="space-y-4"
							onSubmit={form.handleSubmit(handleSubmit)}
						>
							<div className="grid gap-3 md:grid-cols-2">
								<FormField
									control={form.control}
									name="grant_date"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Grant date</FormLabel>
											<FormControl>
												<Input
													type="date"
													{...field}
													disabled={isSubmitting || mode === "edit"}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="total_shares"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Total shares</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={1}
													step={1}
													{...field}
													value={
														Number.isNaN(field.value)
															? ""
															: field.value ?? ""
													}
													onChange={(event) =>
														field.onChange(event.target.valueAsNumber)
													}
													disabled={isSubmitting || mode === "edit"}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="exercise_price"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Exercise price</FormLabel>
											<FormControl>
												<Input
													type="number"
													min={0}
													step="0.01"
													{...field}
													disabled={isSubmitting || mode === "edit"}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="vesting_strategy"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Vesting strategy</FormLabel>
											<Select
												value={field.value}
												onValueChange={field.onChange}
												disabled={isSubmitting || mode === "edit"}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select strategy" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													<SelectItem value="IMMEDIATE">Immediate</SelectItem>
													<SelectItem value="SCHEDULED">Scheduled</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
								{mode === "edit" ? (
									<FormField
										control={form.control}
										name="status"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Status</FormLabel>
												<Select
													value={field.value ?? "ACTIVE"}
													onValueChange={field.onChange}
													disabled={isSubmitting}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select status" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="ACTIVE">Active</SelectItem>
														<SelectItem value="CANCELLED">Cancelled</SelectItem>
														<SelectItem value="EXERCISED_OUT">
															Exercised out
														</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
								) : null}
								<FormField
									control={form.control}
									name="notes"
									render={({ field }) => (
										<FormItem className="md:col-span-2">
											<FormLabel>Notes</FormLabel>
											<FormControl>
												<Input
													placeholder="Optional note"
													{...field}
													value={field.value ?? ""}
													disabled={isSubmitting}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</div>

							{showScheduledFields ? (
								<div className="space-y-3">
									<div className="flex items-center justify-between">
										<p className="text-sm font-semibold text-foreground">
											Vesting schedule
										</p>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => append({ vest_date: "", shares: 0 })}
											disabled={isSubmitting}
										>
											Add event
										</Button>
									</div>

									{fields.length === 0 ? (
										<p className="text-xs text-muted-foreground">
											Add vesting events to match the total shares.
										</p>
									) : (
										<div className="space-y-2">
											{fields.map((fieldItem, index) => (
												<div
													key={fieldItem.id}
													className="grid gap-3 rounded-md border border-border/60 bg-muted/20 p-3 md:grid-cols-[1fr_160px_auto]"
												>
													<FormField
														control={form.control}
														name={`vesting_events.${index}.vest_date`}
														render={({ field }) => (
															<FormItem>
																<FormLabel className="text-xs">
																	Vest date
																</FormLabel>
																<FormControl>
																	<Input
																		type="date"
																		{...field}
																		disabled={isSubmitting}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<FormField
														control={form.control}
														name={`vesting_events.${index}.shares`}
														render={({ field }) => (
															<FormItem>
																<FormLabel className="text-xs">
																	Shares
																</FormLabel>
																<FormControl>
																	<Input
																		type="number"
																		min={1}
																		step={1}
																		{...field}
																		value={
																			Number.isNaN(field.value)
																				? ""
																				: field.value ?? ""
																		}
																		onChange={(event) =>
																			field.onChange(event.target.valueAsNumber)
																		}
																		disabled={isSubmitting}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
													<div className="flex items-end">
														<Button
															type="button"
															variant="ghost"
															size="sm"
															onClick={() => remove(index)}
															disabled={isSubmitting || fields.length <= 1}
														>
															Remove
														</Button>
													</div>
												</div>
											))}
										</div>
									)}
									{errors.vesting_events?.message ? (
										<p className="text-xs text-destructive">
											{errors.vesting_events.message}
										</p>
									) : null}
								</div>
							) : null}
						</form>
					</Form>
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
					<Button
						type="submit"
						form="stock-grant-form"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Saving..." : "Save grant"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
