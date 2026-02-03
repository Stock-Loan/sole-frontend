import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Checkbox } from "@/shared/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
} from "@/shared/ui/Form/form";
import { FormFieldWrapper } from "@/shared/ui/Form/FormField";
import { loanAdminEditSchema } from "@/entities/loan/schemas";
import type {
	LoanAdminEditFormValues,
	LoanEditDialogProps,
} from "@/entities/loan/types";

const MARITAL_STATUS_OPTIONS = [
	{ value: "SINGLE_NEVER_MARRIED", label: "Single (never married)" },
	{ value: "MARRIED", label: "Married" },
	{ value: "DIVORCED", label: "Divorced" },
	{ value: "WIDOWED", label: "Widowed" },
	{ value: "SEPARATED", label: "Separated" },
];

const EDITABLE_STATUSES = new Set(["DRAFT", "SUBMITTED", "IN_REVIEW"]);

function buildDefaultValues(
	loan: LoanEditDialogProps["loan"]
): LoanAdminEditFormValues {
	const interestType =
		loan?.quote_inputs_snapshot?.desired_interest_type ?? loan?.interest_type;
	const repaymentMethod =
		loan?.quote_inputs_snapshot?.desired_repayment_method ??
		loan?.repayment_method;
	const normalizedInterest =
		interestType === "FIXED" || interestType === "VARIABLE"
			? interestType
			: "";
	const normalizedRepayment =
		repaymentMethod === "BALLOON" ||
		repaymentMethod === "PRINCIPAL_AND_INTEREST"
			? repaymentMethod
			: "";
	return {
		note: "",
		selection_mode:
			loan?.selection_mode ??
			loan?.quote_inputs_snapshot?.selection_mode ??
			"SHARES",
		selection_value:
			loan?.selection_value_snapshot ??
			loan?.quote_inputs_snapshot?.selection_value ??
			"",
		as_of_date: loan?.as_of_date ?? loan?.quote_inputs_snapshot?.as_of_date ?? "",
		desired_interest_type: normalizedInterest,
		desired_repayment_method: normalizedRepayment,
		desired_term_months: loan?.quote_inputs_snapshot?.desired_term_months
			? String(loan.quote_inputs_snapshot.desired_term_months)
			: loan?.term_months
				? String(loan.term_months)
				: "",
		marital_status_snapshot: loan?.marital_status_snapshot ?? "",
		spouse_first_name: loan?.spouse_first_name ?? "",
		spouse_middle_name: loan?.spouse_middle_name ?? "",
		spouse_last_name: loan?.spouse_last_name ?? "",
		spouse_email: loan?.spouse_email ?? "",
		spouse_phone: loan?.spouse_phone ?? "",
		spouse_address: loan?.spouse_address ?? "",
		reset_workflow: false,
		delete_documents: false,
	};
}

export function LoanEditDialog({
	open,
	onOpenChange,
	loan,
	onSubmit,
	isSubmitting,
}: LoanEditDialogProps) {
	const form = useForm<LoanAdminEditFormValues>({
		resolver: zodResolver(loanAdminEditSchema),
		defaultValues: buildDefaultValues(loan),
	});
	const maritalStatus = useWatch({
		control: form.control,
		name: "marital_status_snapshot",
	});
	const isEditable = Boolean(loan && EDITABLE_STATUSES.has(loan.status));
	const interestTypeOptions = useMemo(() => {
		const values = loan?.org_settings_snapshot?.allowed_interest_types ?? [
			"FIXED",
			"VARIABLE",
		];
		return values.map((value) => ({
			value,
			label: value === "FIXED" ? "Fixed" : "Variable",
		}));
	}, [loan?.org_settings_snapshot?.allowed_interest_types]);
	const repaymentOptions = useMemo(() => {
		const values = loan?.org_settings_snapshot?.allowed_repayment_methods ?? [
			"BALLOON",
			"PRINCIPAL_AND_INTEREST",
		];
		return values.map((value) => ({
			value,
			label: value
				.split("_")
				.map(
					(part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()
				)
				.join(" "),
		}));
	}, [loan?.org_settings_snapshot?.allowed_repayment_methods]);

	useEffect(() => {
		if (!open) return;
		form.reset(buildDefaultValues(loan));
	}, [form, loan, open]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>Edit loan application</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (values) => {
							await onSubmit(values);
							form.reset(buildDefaultValues(loan));
						})}
						className="flex min-h-0 flex-1 flex-col"
					>
						<DialogBody className="min-h-0 space-y-6 overflow-y-auto">
							{!isEditable ? (
								<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
									Only draft, submitted, or in-review loans can be edited.
								</div>
							) : null}
								<div className="space-y-3">
									<p className="text-sm font-semibold text-foreground">
										Edit notes
									</p>
									<FormFieldWrapper
										name="note"
										control={form.control}
										label="Reason for edit"
										description="Explain why this edit is being made for audit history."
									>
										{({ field }) => (
											<Textarea
												{...field}
												placeholder="Provide context for this change"
												rows={3}
											/>
										)}
									</FormFieldWrapper>
								</div>
								<div className="space-y-3">
									<p className="text-sm font-semibold text-foreground">
										Loan terms
									</p>
									<div className="grid gap-4 md:grid-cols-2">
										<FormField
											control={form.control}
											name="selection_mode"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Selection mode</FormLabel>
													<Select
														value={field.value}
														onValueChange={field.onChange}
														disabled={!isEditable || isSubmitting}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select mode" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value="SHARES">Shares</SelectItem>
															<SelectItem value="PERCENT">Percent</SelectItem>
														</SelectContent>
													</Select>
												</FormItem>
											)}
										/>
										<FormFieldWrapper
											name="selection_value"
											control={form.control}
											label="Selection value"
										>
											{({ field }) => (
												<Input
													{...field}
													placeholder="e.g. 500"
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
										<FormFieldWrapper
											name="as_of_date"
											control={form.control}
											label="As of date"
										>
											{({ field }) => (
												<Input
													type="date"
													{...field}
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
										<FormFieldWrapper
											name="desired_term_months"
											control={form.control}
											label="Desired term (months)"
										>
											{({ field }) => (
												<Input
													{...field}
													type="number"
													min={1}
													placeholder="e.g. 24"
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
										<FormField
											control={form.control}
											name="desired_interest_type"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Interest type</FormLabel>
													<Select
														value={field.value || undefined}
														onValueChange={field.onChange}
														disabled={!isEditable || isSubmitting}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select interest type" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{interestTypeOptions.map((option) => (
																<SelectItem
																	key={option.value}
																	value={option.value}
																>
																	{option.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormItem>
											)}
										/>
										<FormField
											control={form.control}
											name="desired_repayment_method"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Repayment method</FormLabel>
													<Select
														value={field.value || undefined}
														onValueChange={field.onChange}
														disabled={!isEditable || isSubmitting}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue placeholder="Select repayment method" />
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															{repaymentOptions.map((option) => (
																<SelectItem
																	key={option.value}
																	value={option.value}
																>
																	{option.label}
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</FormItem>
											)}
										/>
									</div>
								</div>
								<div className="space-y-3">
									<p className="text-sm font-semibold text-foreground">
										Marital status
									</p>
									<FormField
										control={form.control}
										name="marital_status_snapshot"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Marital status</FormLabel>
												<Select
													value={field.value || undefined}
													onValueChange={field.onChange}
													disabled={!isEditable || isSubmitting}
												>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select status" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														{MARITAL_STATUS_OPTIONS.map((option) => (
															<SelectItem
																key={option.value}
																value={option.value}
															>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</FormItem>
										)}
									/>
									{maritalStatus === "MARRIED" ? (
									<div className="grid gap-4 md:grid-cols-2">
										<FormFieldWrapper
											name="spouse_first_name"
											control={form.control}
											label="Spouse first name"
										>
											{({ field }) => (
												<Input
													{...field}
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
										<FormFieldWrapper
											name="spouse_middle_name"
											control={form.control}
											label="Spouse middle name"
										>
											{({ field }) => (
												<Input
													{...field}
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
										<FormFieldWrapper
											name="spouse_last_name"
											control={form.control}
											label="Spouse last name"
										>
											{({ field }) => (
												<Input
													{...field}
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
										<FormFieldWrapper
											name="spouse_email"
											control={form.control}
											label="Spouse email"
										>
											{({ field }) => (
												<Input
													type="email"
													{...field}
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
										<FormFieldWrapper
											name="spouse_phone"
											control={form.control}
											label="Spouse phone"
										>
											{({ field }) => (
												<Input
													{...field}
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
										<FormFieldWrapper
											name="spouse_address"
											control={form.control}
											label="Spouse address"
										>
											{({ field }) => (
												<Input
													{...field}
													disabled={!isEditable || isSubmitting}
												/>
											)}
										</FormFieldWrapper>
									</div>
								) : (
									<p className="text-xs text-muted-foreground">
										Spouse details are only required for married applicants.
									</p>
								)}
							</div>
							<div className="space-y-3">
								<p className="text-sm font-semibold text-foreground">
									Workflow controls
								</p>
								<FormField
									control={form.control}
									name="reset_workflow"
									render={({ field }) => (
										<FormItem className="flex items-start space-x-3 space-y-0">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													disabled={!isEditable || isSubmitting}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Reset workflow</FormLabel>
												<FormDescription>
													Restart the workflow stages from the beginning.
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="delete_documents"
									render={({ field }) => (
										<FormItem className="flex items-start space-x-3 space-y-0">
											<FormControl>
												<Checkbox
													checked={field.value}
													onCheckedChange={field.onChange}
													disabled={!isEditable || isSubmitting}
												/>
											</FormControl>
											<div className="space-y-1 leading-none">
												<FormLabel>Delete documents</FormLabel>
												<FormDescription>
													Remove existing workflow documents after the edit.
												</FormDescription>
											</div>
										</FormItem>
									)}
								/>
							</div>
						</DialogBody>
						<DialogFooter>
							<Button
								variant="outline"
								type="button"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSubmitting || !isEditable}
							>
								{isSubmitting ? "Saving..." : "Save changes"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
