import { useMemo } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { usePermissions } from "@/auth/hooks";
import { formatDate } from "@/shared/lib/format";
import { useLoanDashboardSummary } from "@/entities/loan/hooks";
import {
	buildActiveInterestItems,
	buildActiveRepaymentItems,
	buildLoanStageItems,
	buildLoanStatusItems,
	buildLoanSummaryMetrics,
} from "@/entities/loan/utils/summary";
import { LoanSummaryMetricGrid } from "@/entities/loan/components/loan-pages/LoanSummaryMetricGrid";
import { LoanSummaryPieChart } from "@/entities/loan/components/loan-pages/LoanSummaryPieChart";

const CHART_LAYOUT = "grid gap-4 lg:grid-cols-2";

export function LoanSummaryPage() {
	const { can } = usePermissions();
	const canViewSummary = can("loan.dashboard.view");
	const summaryQuery = useLoanDashboardSummary({}, { enabled: canViewSummary });

	const summary = summaryQuery.data;
	const metrics = useMemo(() => buildLoanSummaryMetrics(summary), [summary]);
	const statusItems = useMemo(() => buildLoanStatusItems(summary), [summary]);
	const stageItems = useMemo(() => buildLoanStageItems(summary), [summary]);
	const interestItems = useMemo(
		() => buildActiveInterestItems(summary),
		[summary],
	);
	const repaymentItems = useMemo(
		() => buildActiveRepaymentItems(summary),
		[summary],
	);
	const openStageTotal = stageItems.reduce((sum, item) => sum + item.value, 0);
	const activeInterestTotal = interestItems.reduce(
		(sum, item) => sum + item.value,
		0,
	);
	const activeRepaymentTotal = repaymentItems.reduce(
		(sum, item) => sum + item.value,
		0,
	);

	if (!canViewSummary) {
		return (
			<PageContainer className="space-y-6">
				<EmptyState
					title="Loan summary unavailable"
					message="You do not have permission to view loan summary metrics."
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan Summary"
				subtitle={
					summary?.as_of
						? `As of ${formatDate(summary.as_of)}`
						: "Monitor loan activity and workflow health."
				}
			/>

			{summaryQuery.isLoading ? (
				<LoanSummarySkeleton />
			) : summaryQuery.isError ? (
				<EmptyState
					title="Unable to load summary"
					message="We couldn't fetch loan dashboard metrics right now."
					actionLabel="Retry"
					onRetry={() => summaryQuery.refetch()}
				/>
			) : (
				<div className="space-y-6">
					<LoanSummaryMetricGrid metrics={metrics} />

					<div className={CHART_LAYOUT}>
						<LoanSummaryPieChart
							title="Loan status breakdown"
							items={statusItems}
							total={summary?.total_loans}
							emptyMessage="No loan status data yet."
						/>
						<LoanSummaryPieChart
							title="Open workflow stages"
							items={stageItems}
							total={openStageTotal}
							emptyMessage="No open workflow stages."
						/>
					</div>

					<div className={CHART_LAYOUT}>
						<LoanSummaryPieChart
							title="Loans by Interest Types"
							items={interestItems}
							total={activeInterestTotal}
							emptyMessage="No active loan interest data."
						/>
						<LoanSummaryPieChart
							title="Loans by Repayment Method"
							items={repaymentItems}
							total={activeRepaymentTotal}
							emptyMessage="No active repayment data."
						/>
					</div>
				</div>
			)}
		</PageContainer>
	);
}

function LoanSummarySkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{Array.from({ length: 8 }).map((_, index) => (
					<Card key={`loan-summary-metric-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-3 w-28" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-7 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<Card key={`loan-summary-chart-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-32" />
						</CardHeader>
						<CardContent className="space-y-3">
							{Array.from({ length: 4 }).map((__, rowIndex) => (
								<div
									key={`loan-summary-chart-row-${rowIndex}`}
									className="space-y-2"
								>
									<Skeleton className="h-3 w-32" />
									<Skeleton className="h-2 w-full" />
								</div>
							))}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
