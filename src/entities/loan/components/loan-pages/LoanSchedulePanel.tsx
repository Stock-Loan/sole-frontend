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
import { formatCurrency, formatDate, formatPercent } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import type { LoanSchedulePanelProps } from "@/entities/loan/types";

export function LoanSchedulePanel({
	schedule,
	isLoading,
	isError,
	onRetry,
	actions,
}: LoanSchedulePanelProps) {
	if (isLoading) {
		return <LoadingState label="Loading schedule..." />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load schedule"
				message="We couldn't fetch the amortization schedule."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	if (!schedule) {
		return (
			<EmptyState
				title="No schedule available"
				message="Schedule data will appear once the loan is active."
			/>
		);
	}

	return (
		<Card>
			<CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
				<CardTitle className="text-sm font-semibold">Schedule</CardTitle>
				{actions ? (
					<div className="flex items-center gap-2">{actions}</div>
				) : null}
			</CardHeader>
			<CardContent className="space-y-4 text-sm text-muted-foreground">
				<div className="grid gap-3 md:grid-cols-3">
					<div>
						<p className="text-xs uppercase tracking-wide">As of date</p>
						<p className="text-sm font-semibold text-foreground">
							{formatDate(schedule.as_of_date)}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide">Repayment</p>
						<p className="text-sm font-semibold text-foreground">
							{normalizeDisplay(schedule.repayment_method)}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide">Term</p>
						<p className="text-sm font-semibold text-foreground">
							{schedule.term_months} months
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide">Principal</p>
						<p className="text-sm font-semibold text-foreground">
							{formatCurrency(schedule.principal)}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide">Annual rate</p>
						<p className="text-sm font-semibold text-foreground">
							{formatPercent(schedule.annual_rate_percent)}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide">Monthly payment</p>
						<p className="text-sm font-semibold text-foreground">
							{formatCurrency(schedule.estimated_monthly_payment)}
						</p>
					</div>
				</div>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Period</TableHead>
							<TableHead>Due date</TableHead>
							<TableHead>Payment</TableHead>
							<TableHead>Principal</TableHead>
							<TableHead>Interest</TableHead>
							<TableHead>Remaining balance</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{schedule.entries.map((entry) => (
							<TableRow key={`${schedule.loan_id}-${entry.period}`}>
								<TableCell>{entry.period}</TableCell>
								<TableCell>{formatDate(entry.due_date)}</TableCell>
								<TableCell>{formatCurrency(entry.payment)}</TableCell>
								<TableCell>{formatCurrency(entry.principal)}</TableCell>
								<TableCell>{formatCurrency(entry.interest)}</TableCell>
								<TableCell>{formatCurrency(entry.remaining_balance)}</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</CardContent>
		</Card>
	);
}
