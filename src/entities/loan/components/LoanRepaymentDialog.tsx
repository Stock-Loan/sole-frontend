import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/input";
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
			amount: "",
			principal_amount: "",
			interest_amount: "",
			payment_date: "",
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
								name="amount"
								control={form.control}
								label="Amount"
							>
								{({ field }) => (
									<Input placeholder="500.00" {...field} />
								)}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="principal_amount"
								control={form.control}
								label="Principal amount"
							>
								{({ field }) => (
									<Input placeholder="420.00" {...field} />
								)}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="interest_amount"
								control={form.control}
								label="Interest amount"
							>
								{({ field }) => (
									<Input placeholder="80.00" {...field} />
								)}
							</FormFieldWrapper>
							<FormFieldWrapper
								name="payment_date"
								control={form.control}
								label="Payment date"
							>
								{({ field }) => (
									<Input type="date" {...field} />
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
