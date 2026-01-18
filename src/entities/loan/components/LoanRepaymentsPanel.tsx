import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/Table/table";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import type { LoanRepaymentsPanelProps } from "@/entities/loan/components/types";

export function LoanRepaymentsPanel({
	repayments,
	total,
	isLoading,
	isError,
	onRetry,
}: LoanRepaymentsPanelProps) {
	if (isLoading) {
		return <LoadingState label="Loading repayments..." />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load repayments"
				message="We couldn't fetch repayments for this loan."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	if (!repayments || repayments.length === 0) {
		return (
			<EmptyState
				title="No repayments yet"
				message="Repayment activity will appear once payments are recorded."
			/>
		);
	}

	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-sm font-semibold">
					Repayments {typeof total === "number" ? `(${total})` : ""}
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-4 text-sm text-muted-foreground">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Payment date</TableHead>
							<TableHead>Amount</TableHead>
							<TableHead>Principal</TableHead>
							<TableHead>Interest</TableHead>
							<TableHead>Recorded by</TableHead>
							<TableHead>Created</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{repayments.map((repayment) => (
							<TableRow key={repayment.id}>
								<TableCell>{formatDate(repayment.payment_date)}</TableCell>
								<TableCell>{formatCurrency(repayment.amount)}</TableCell>
								<TableCell>
									{formatCurrency(repayment.principal_amount)}
								</TableCell>
								<TableCell>
									{formatCurrency(repayment.interest_amount)}
								</TableCell>
								<TableCell>
									{repayment.recorded_by_user_id ?? "—"}
								</TableCell>
								<TableCell>{formatDate(repayment.created_at)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
