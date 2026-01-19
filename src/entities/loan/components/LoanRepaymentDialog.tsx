import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/input";
import { PickDocument } from "@/shared/ui/PickDocument";
import { Form } from "@/shared/ui/Form/form";
import { FormFieldWrapper } from "@/shared/ui/Form/FormField";
import { loanRepaymentSchema } from "@/entities/loan/schemas";
import type { LoanRepaymentCreatePayload } from "@/entities/loan/types";
import type { LoanRepaymentDialogProps } from "@/entities/loan/components/types";

export function LoanRepaymentDialog({
	open,
	onOpenChange,
	onSubmit,
	isSubmitting,
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

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>Record repayment</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(async (values) => {
							await onSubmit(values);
							form.reset();
						})}
						className="space-y-4"
					>
						<DialogBody className="space-y-4">
							<FormFieldWrapper
								name="payment_date"
								control={form.control}
								label="Payment date"
							>
								{({ field }) => (
									<Input type="date" {...field} />
								)}
							</FormFieldWrapper>
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
								{({ field }) => (
									<Input placeholder="0.00" {...field} />
								)}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="extra_interest_amount"
								control={form.control}
								label="Extra interest amount"
							>
								{({ field }) => (
									<Input placeholder="0.00" {...field} />
								)}
							</FormFieldWrapper>
							<div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-900">
								<p className="font-semibold">Optional overrides</p>
								<p className="mt-1 text-amber-800">
									Use these only if you need to override the computed totals.
									If provided, they must match the calculated amounts.
								</p>
							</div>
							<FormFieldWrapper
								name="amount"
								control={form.control}
								label="Amount (override)"
							>
								{({ field }) => (
									<Input placeholder="500.00" {...field} />
								)}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="principal_amount"
								control={form.control}
								label="Principal amount (override)"
							>
								{({ field }) => (
									<Input placeholder="420.00" {...field} />
								)}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="interest_amount"
								control={form.control}
								label="Interest amount (override)"
							>
								{({ field }) => (
									<Input placeholder="80.00" {...field} />
								)}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="evidence_file"
								control={form.control}
								label="Evidence file (optional)"
							>
								{({ field }) => (
									<PickDocument
										file={field.value ?? null}
										onFileChange={(file) => field.onChange(file)}
										accept=".pdf,image/*"
										label="Attach evidence (optional)"
										helperText="PDF or image files only."
									/>
								)}
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
								{isSubmitting ? "Saving..." : "Record repayment"}
							</Button>
						</DialogFooter>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
