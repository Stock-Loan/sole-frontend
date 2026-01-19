import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type { Control, Resolver } from "react-hook-form";
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
import { Form } from "@/shared/ui/Form/form";
import { FormFieldWrapper } from "@/shared/ui/Form/FormField";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { normalizeDisplay } from "@/shared/lib/utils";
import { loanScheduleWhatIfSchema } from "@/entities/loan/schemas";
import { loanWizardRepaymentMethodOptions } from "@/entities/loan/components/loan-wizard/constants";
import type { LoanScheduleWhatIfDialogProps } from "@/entities/loan/components/types";
import type { LoanScheduleWhatIfPayload } from "@/entities/loan/types";

export function LoanScheduleWhatIfDialog({
	open,
	onOpenChange,
	onSubmit,
	isSubmitting,
	initialValues,
}: LoanScheduleWhatIfDialogProps) {
	const fallbackDate = useMemo(() => new Date().toISOString().slice(0, 10), []);
	const defaultValues = useMemo<LoanScheduleWhatIfPayload>(
		() => ({
			as_of_date: initialValues?.as_of_date ?? fallbackDate,
			repayment_method:
				initialValues?.repayment_method ?? "PRINCIPAL_AND_INTEREST",
			term_months: initialValues?.term_months ?? 12,
			annual_rate_percent: initialValues?.annual_rate_percent ?? "",
			principal: initialValues?.principal ?? "",
		}),
		[initialValues, fallbackDate],
	);
	const form = useForm<LoanScheduleWhatIfPayload>({
		resolver: zodResolver(
			loanScheduleWhatIfSchema,
		) as Resolver<LoanScheduleWhatIfPayload>,
		defaultValues,
	});

	useEffect(() => {
		if (open) {
			form.reset(defaultValues);
		}
	}, [open, form, defaultValues]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>Run what-if scenario</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (values) => {
							const payload: LoanScheduleWhatIfPayload = {
								...(values as LoanScheduleWhatIfPayload),
								principal: values.principal?.trim() || undefined,
							};
							await onSubmit(payload);
							form.reset(defaultValues);
						})}
						className="flex min-h-0 flex-1 flex-col"
					>
						<DialogBody className="min-h-0 space-y-4">
							<FormFieldWrapper
								name="as_of_date"
								control={form.control as Control<LoanScheduleWhatIfPayload>}
								label="As of date"
							>
								{({ field }) => <Input type="date" {...field} />}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="repayment_method"
								control={form.control as Control<LoanScheduleWhatIfPayload>}
								label="Repayment method"
							>
								{({ field }) => (
									<Select
										value={field.value as string | undefined}
										onValueChange={field.onChange as (value: string) => void}
										disabled={isSubmitting}
									>
										<SelectTrigger>
											<SelectValue placeholder="Select method" />
										</SelectTrigger>
										<SelectContent>
											{loanWizardRepaymentMethodOptions.map((option) => (
												<SelectItem key={option.value} value={option.value}>
													{option.label ?? normalizeDisplay(option.value)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								)}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="term_months"
								control={form.control as Control<LoanScheduleWhatIfPayload>}
								label="Term (months)"
							>
								{({ field }) => <Input type="number" min={1} {...field} />}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="annual_rate_percent"
								control={form.control as Control<LoanScheduleWhatIfPayload>}
								label="Annual rate (%)"
							>
								{({ field }) => <Input placeholder="12.50" {...field} />}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="principal"
								control={form.control as Control<LoanScheduleWhatIfPayload>}
								label="Principal (optional)"
							>
								{({ field }) => <Input placeholder="25000.00" {...field} />}
							</FormFieldWrapper>
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
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Running..." : "Run what-if"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
