import { Link, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { routes } from "@/shared/lib/routes";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import { usePermissions } from "@/auth/hooks";
import { useMyLoanApplication } from "@/entities/loan/hooks";
import { cn } from "@/shared/lib/utils";

export function MyLoanDetailPage() {
	const { id } = useParams();
	const { can } = usePermissions();
	const canViewLoans = can("loan.view_own");
	const canApplyLoan = can("loan.apply");

	const loanQuery = useMyLoanApplication(id ?? "", { enabled: canViewLoans });
	const loan = loanQuery.data;

	if (!canViewLoans) {
		return (
			<PageContainer className="space-y-4">
				<PageHeader
					title="Loan application"
					subtitle="Review your loan application details."
				/>
				<EmptyState
					title="Loan application unavailable"
					message="You do not have permission to view loan applications."
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan application"
				subtitle="Review your loan application details."
				actions={
					loan?.status === "DRAFT" && canApplyLoan ? (
						<Button asChild size="sm">
							<Link
								to={routes.workspaceLoanWizardEdit.replace(":id", loan.id)}
							>
								Edit draft
							</Link>
						</Button>
					) : null
				}
			/>

			{loanQuery.isLoading ? (
				<LoanDetailSkeleton />
			) : loanQuery.isError || !loan ? (
				<EmptyState
					title="Unable to load loan"
					message="We couldn't fetch this loan application."
					actionLabel="Retry"
					onRetry={() => loanQuery.refetch()}
				/>
			) : (
				<div className="space-y-6">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
						<SummaryCard label="Status" value={loan.status} />
						<SummaryCard
							label="Shares to exercise"
							value={formatShares(loan.shares_to_exercise)}
						/>
						<SummaryCard
							label="Loan principal"
							value={formatCurrency(loan.loan_principal)}
						/>
						<SummaryCard
							label="Term"
							value={loan.term_months ? `${loan.term_months} months` : "—"}
						/>
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-semibold">
									Quote summary
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm text-muted-foreground">
								<DetailRow label="Interest type" value={loan.interest_type} />
								<DetailRow
									label="Repayment method"
									value={loan.repayment_method}
								/>
								<DetailRow
									label="Estimated monthly payment"
									value={formatCurrency(loan.estimated_monthly_payment)}
								/>
								<DetailRow
									label="Total interest"
									value={formatCurrency(loan.total_interest_amount)}
								/>
								<DetailRow
									label="Total payable"
									value={formatCurrency(loan.total_payable_amount)}
								/>
							</CardContent>
						</Card>
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-semibold">
									Selection snapshot
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm text-muted-foreground">
								<DetailRow
									label="As of date"
									value={formatDate(loan.as_of_date)}
								/>
								<DetailRow
									label="Selection mode"
									value={loan.selection_mode ?? loan.quote_inputs_snapshot?.selection_mode}
								/>
								<DetailRow
									label="Selection value"
									value={loan.selection_value_snapshot ?? loan.quote_inputs_snapshot?.selection_value}
								/>
								<DetailRow
									label="Total exercisable"
									value={
										loan.total_exercisable_shares_snapshot
											? loan.total_exercisable_shares_snapshot.toLocaleString()
											: "—"
									}
								/>
							</CardContent>
						</Card>
					</div>

					{loan.marital_status_snapshot ? (
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-semibold">
									Consents
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm text-muted-foreground">
								<DetailRow
									label="Marital status"
									value={loan.marital_status_snapshot}
								/>
								{loan.spouse_first_name || loan.spouse_last_name ? (
									<DetailRow
										label="Spouse/partner"
										value={`${loan.spouse_first_name ?? ""} ${loan.spouse_last_name ?? ""}`.trim()}
									/>
								) : null}
								<DetailRow label="Spouse email" value={loan.spouse_email} />
								<DetailRow label="Spouse phone" value={loan.spouse_phone} />
							</CardContent>
						</Card>
					) : null}

					{loan.decision_reason ? (
						<div
							className={cn(
								"rounded-lg border p-4",
								loan.status === "REJECTED"
									? "border-red-200 bg-red-50/70"
									: "border-amber-200 bg-amber-50/70"
							)}
						>
							<div className="flex items-start gap-3">
								{loan.status === "REJECTED" ? (
									<AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
								) : (
									<CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-600" />
								)}
								<div>
									<p className="text-sm font-semibold text-foreground">
										Decision notes
									</p>
									<p className="text-sm text-muted-foreground">
										{loan.decision_reason}
									</p>
								</div>
							</div>
						</div>
					) : null}
				</div>
			)}
		</PageContainer>
	);
}

function SummaryCard({ label, value }: { label: string; value?: string }) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-semibold text-foreground">{value || "—"}</p>
			</CardContent>
		</Card>
	);
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span>{label}</span>
			<span className="text-foreground">{value || "—"}</span>
		</div>
	);
}

function LoanDetailSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Card key={`loan-detail-skeleton-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-3 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-7 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<Card key={`loan-detail-card-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-32" />
						</CardHeader>
						<CardContent className="space-y-3">
							{Array.from({ length: 5 }).map((__, rowIndex) => (
								<div
									key={`loan-detail-row-${index}-${rowIndex}`}
									className="flex items-center justify-between"
								>
									<Skeleton className="h-3 w-28" />
									<Skeleton className="h-3 w-24" />
								</div>
							))}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
