import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { routes } from "@/shared/lib/routes";
import { formatDate } from "@/shared/lib/format";
import { usePermissions } from "@/auth/hooks";
import { useStockDashboardSummary } from "@/features/dashboard/hooks";

function formatMetric(value?: number) {
	if (value === null || value === undefined) return "—";
	return value.toLocaleString();
}

export function OverviewPage() {
	const { can } = usePermissions();
	const canViewStock = can("stock.dashboard.view");
	const summaryQuery = useStockDashboardSummary({}, { enabled: canViewStock });

	const summary = summaryQuery.data;
	const metricCards = summary
		? [
				{
					label: "Total program employees",
					value: formatMetric(summary.total_program_employees),
				},
				{
					label: "Total granted shares",
					value: formatMetric(summary.total_granted_shares),
				},
				{
					label: "Total vested shares",
					value: formatMetric(summary.total_vested_shares),
				},
				{
					label: "Total unvested shares",
					value: formatMetric(summary.total_unvested_shares),
				},
				{
					label: "Eligible to exercise",
					value: formatMetric(summary.eligible_to_exercise_count),
				},
				{
					label: "Blocked by service rule",
					value: formatMetric(summary.not_eligible_due_to_service_count),
				},
				{
					label: "Blocked by min vested rule",
					value: formatMetric(summary.not_eligible_due_to_min_vested_count),
				},
				{
					label: "Other ineligible",
					value: formatMetric(summary.not_eligible_due_to_other_count ?? 0),
				},
				{
					label: "Next global vesting date",
					value: formatDate(summary.next_global_vesting_date),
				},
		  ]
		: [];

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Dashboard"
				subtitle="Track stock program coverage and eligibility at a glance."
			/>

			{!canViewStock ? (
				<EmptyState
					title="Stock metrics unavailable"
					message="You do not have permission to view the stock dashboard metrics."
				/>
			) : summaryQuery.isLoading ? (
				<LoadingState label="Loading dashboard metrics..." />
			) : summaryQuery.isError ? (
				<EmptyState
					title="Unable to load dashboard"
					message="We couldn't fetch stock program metrics right now."
					actionLabel="Retry"
					onRetry={() => summaryQuery.refetch()}
				/>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{metricCards.map((metric) => (
						<Card key={metric.label}>
							<CardHeader className="pb-2">
								<CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									{metric.label}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-2xl font-semibold text-foreground">
									{metric.value}
								</p>
							</CardContent>
						</Card>
					))}
					<Card className="border-dashed">
						<CardHeader className="pb-2">
							<CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								System status
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<p className="text-sm text-muted-foreground">
								Check API availability and service health.
							</p>
							<Button asChild variant="outline" size="sm">
								<Link to={routes.status}>View status</Link>
							</Button>
						</CardContent>
					</Card>
				</div>
			)}
		</PageContainer>
	);
}
