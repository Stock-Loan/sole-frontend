import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import { formatShares } from "@/entities/stock-grant/constants";
import { LoanStatusBadge } from "@/entities/loan/components/LoanStatusBadge";
import type { LoanWorkflowSummaryProps } from "@/entities/loan/components/types";

export function LoanWorkflowSummary({
	loan,
	stockSummary,
}: LoanWorkflowSummaryProps) {
	const applicantName =
		loan.applicant?.full_name ??
		loan.applicant?.email ??
		loan.org_membership_id ??
		"—";

	const applicantRows = [
		{ label: "Applicant", value: applicantName },
		{ label: "Email", value: loan.applicant?.email ?? "—" },
		{ label: "Employee ID", value: loan.applicant?.employee_id ?? "—" },
		{ label: "Department", value: loan.applicant?.department_name ?? "—" },
	];

	const loanRows = [
		{ label: "Loan ID", value: loan.id },
		{
			label: "Status",
			value: <LoanStatusBadge status={loan.status} />,
		},
		{ label: "Shares to exercise", value: formatShares(loan.shares_to_exercise) },
		{ label: "Purchase price", value: formatCurrency(loan.purchase_price) },
		{ label: "Loan principal", value: formatCurrency(loan.loan_principal) },
		{
			label: "Interest type",
			value: normalizeDisplay(loan.interest_type ?? "—"),
		},
		{
			label: "Repayment method",
			value: normalizeDisplay(loan.repayment_method ?? "—"),
		},
		{
			label: "Term",
			value: loan.term_months ? `${loan.term_months} months` : "—",
		},
		{ label: "Created", value: formatDate(loan.created_at) },
		{ label: "Updated", value: formatDate(loan.updated_at) },
	];

	const stockRows = stockSummary
		? [
				{
					label: "Total granted shares",
					value: formatShares(stockSummary.total_granted_shares),
				},
				{
					label: "Total vested shares",
					value: formatShares(stockSummary.total_vested_shares),
				},
				{
					label: "Total unvested shares",
					value: formatShares(stockSummary.total_unvested_shares),
				},
		  ]
		: [];

	return (
		<div className="grid gap-4 lg:grid-cols-3">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">Applicant</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					{applicantRows.map((row) => (
						<div
							key={row.label}
							className="flex items-center justify-between gap-3"
						>
							<span>{row.label}</span>
							<span className="text-foreground">{row.value}</span>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">Loan summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					{loanRows.map((row) => (
						<div
							key={row.label}
							className="flex items-center justify-between gap-3"
						>
							<span>{row.label}</span>
							<span className="text-foreground">{row.value}</span>
						</div>
					))}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">
						Stock summary
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					{stockRows.length === 0 ? (
						<p>Stock summary unavailable for this view.</p>
					) : (
						stockRows.map((row) => (
							<div
								key={row.label}
								className="flex items-center justify-between gap-3"
							>
								<span>{row.label}</span>
								<span className="text-foreground">{row.value}</span>
							</div>
						))
					)}
				</CardContent>
			</Card>
		</div>
	);
}
