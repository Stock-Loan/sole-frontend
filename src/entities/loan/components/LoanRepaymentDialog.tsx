import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
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
import { PickDocument } from "@/shared/ui/PickDocument";
import { Form } from "@/shared/ui/Form/form";
import { FormFieldWrapper } from "@/shared/ui/Form/FormField";
import { formatCurrency } from "@/shared/lib/format";
import { loanRepaymentSchema } from "@/entities/loan/schemas";
import type { LoanRepaymentCreatePayload } from "@/entities/loan/types";
import type { LoanRepaymentDialogProps } from "@/entities/loan/components/types";

export function LoanRepaymentDialog({
	open,
	onOpenChange,
	onSubmit,
	isSubmitting,
	nextPaymentAmount,
	nextPrincipalDue,
	nextInterestDue,
}: LoanRepaymentDialogProps) {
	const form = useForm<LoanRepaymentCreatePayload>({
		resolver: zodResolver(loanRepaymentSchema),
		defaultValues: {
			payment_date: "",
			evidence_file: null,
			extra_principal_amount: "",
			extra_interest_amount: "",
			amount: "",
			principal_amount: "",
			interest_amount: "",
		},
	});
	const [showOverrides, setShowOverrides] = useState(false);
	const extraPrincipal = useWatch({
		control: form.control,
		name: "extra_principal_amount",
	});
	const extraInterest = useWatch({
		control: form.control,
		name: "extra_interest_amount",
	});

	const totalPaymentLabel = (() => {
		const toNumber = (value?: string | number | null) => {
			if (value === null || value === undefined) return 0;
			const normalized = String(value).replace(/,/g, "").trim();
			if (!normalized) return 0;
			const parsed = Number(normalized);
			return Number.isFinite(parsed) ? parsed : 0;
		};
		const scheduledAmount = toNumber(nextPaymentAmount);
		const scheduledPrincipal = toNumber(nextPrincipalDue);
		const scheduledInterest = toNumber(nextInterestDue);
		const base = scheduledAmount || scheduledPrincipal + scheduledInterest || 0;
		const extraTotal = toNumber(extraPrincipal) + toNumber(extraInterest);
		return formatCurrency(base + extraTotal);
	})();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>Record repayment</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (values) => {
							await onSubmit(values);
							form.reset();
						})}
						className="flex min-h-0 flex-1 flex-col"
					>
						<DialogBody className="min-h-0 space-y-4">
							<FormFieldWrapper
								name="payment_date"
								control={form.control}
								label="Payment date"
							>
								{({ field }) => <Input type="date" {...field} />}
							</FormFieldWrapper>
							<div className="rounded-md border border-border/60 bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
								<p className="font-semibold text-foreground">
									Next payment (read-only)
								</p>
								<p className="mt-1">
									These values are pulled from the latest loan schedule.
								</p>
							</div>
							<div className="grid gap-3 md:grid-cols-3">
								<div className="space-y-2 text-xs text-muted-foreground">
									<p className="font-medium text-foreground">
										Scheduled amount
									</p>
									<Input
										value={formatCurrency(nextPaymentAmount)}
										readOnly
										disabled
									/>
								</div>
								<div className="space-y-2 text-xs text-muted-foreground">
									<p className="font-medium text-foreground">
										Scheduled principal
									</p>
									<Input
										value={formatCurrency(nextPrincipalDue)}
										readOnly
										disabled
									/>
								</div>
								<div className="space-y-2 text-xs text-muted-foreground">
									<p className="font-medium text-foreground">
										Scheduled interest
									</p>
									<Input
										value={formatCurrency(nextInterestDue)}
										readOnly
										disabled
									/>
								</div>
							</div>
							<div className="rounded-md border border-border/60 bg-muted/30 px-3 py-3 text-xs text-muted-foreground">
								<p className="font-semibold text-foreground">
									Optional adjustments
								</p>
								<p className="mt-1">
									Enter extra principal or interest if this payment includes
									additional amounts. Leave blank to use the scheduled payment.
								</p>
							</div>
							<FormFieldWrapper
								name="extra_principal_amount"
								control={form.control}
								label="Extra principal amount"
							>
								{({ field }) => <Input placeholder="0.00" {...field} />}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="extra_interest_amount"
								control={form.control}
								label="Extra interest amount"
							>
								{({ field }) => <Input placeholder="0.00" {...field} />}
							</FormFieldWrapper>
							<div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
								<div>
									<p className="font-semibold">Overrides (optional)</p>
									<p className="mt-0.5 text-amber-800">
										Enable only if you need to override the computed totals.
									</p>
								</div>
								<Button
									type="button"
									variant="outline"
									size="sm"
									onClick={() => {
										setShowOverrides((prev) => {
											const next = !prev;
											if (!next) {
												form.setValue("amount", "");
												form.setValue("principal_amount", "");
												form.setValue("interest_amount", "");
											}
											return next;
										});
									}}
								>
									{showOverrides ? "Hide overrides" : "Enable overrides"}
								</Button>
							</div>
							{showOverrides ? (
								<>
									<FormFieldWrapper
										name="amount"
										control={form.control}
										label="Amount (override)"
									>
										{({ field }) => <Input placeholder="500.00" {...field} />}
									</FormFieldWrapper>
									<FormFieldWrapper
										name="principal_amount"
										control={form.control}
										label="Principal amount (override)"
									>
										{({ field }) => <Input placeholder="420.00" {...field} />}
									</FormFieldWrapper>
									<FormFieldWrapper
										name="interest_amount"
										control={form.control}
										label="Interest amount (override)"
									>
										{({ field }) => <Input placeholder="80.00" {...field} />}
									</FormFieldWrapper>
								</>
							) : null}
							<FormFieldWrapper
								name="evidence_file"
								control={form.control}
								label="Evidence file (optional)"
							>
								{({ field }) => (
									<PickDocument
										file={(field.value as File | null) ?? null}
										onFileChange={(file) =>
											(field.onChange as (value: File | null) => void)(file)
										}
										accept=".pdf,image/*"
										label="Attach evidence (optional)"
										helperText="PDF or image files only."
									/>
								)}
							</FormFieldWrapper>
						</DialogBody>
						<DialogFooter>
							<div className="mr-auto text-xs text-muted-foreground">
								Total payment:{" "}
								<span className="font-semibold text-foreground">
									{totalPaymentLabel}
								</span>
							</div>
							<Button
								variant="outline"
								type="button"
								onClick={() => onOpenChange(false)}
								disabled={isSubmitting}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? "Saving..." : "Record repayment"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
