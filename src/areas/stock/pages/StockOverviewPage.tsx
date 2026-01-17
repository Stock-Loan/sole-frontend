import { Link } from "react-router-dom";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { routes } from "@/shared/lib/routes";
import { formatDate } from "@/shared/lib/format";
import { usePermissions } from "@/auth/hooks";
import { useStockDashboardSummary } from "@/features/dashboard/hooks";
import { colorPalette } from "@/app/styles/color-palette";

function formatMetric(value?: number) {
	if (value === null || value === undefined) return "—";
	return value.toLocaleString();
}

export function StockOverviewPage() {
	const { can } = usePermissions();
	const canViewStock = can("stock.dashboard.view");
	const summaryQuery = useStockDashboardSummary({}, { enabled: canViewStock });

	const summary = summaryQuery.data;
	const metricCardStyle = {
		borderColor: colorPalette.slate[200],
		backgroundColor: colorPalette.semantic.surface,
	};
	const metricLabelStyle = { color: colorPalette.slate[500] };
	const metricValueStyle = { color: colorPalette.navy[900] };
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
				title="Stock Dashboard"
				subtitle="Track stock program coverage and eligibility at a glance."
				actions={
					<div className="flex flex-wrap gap-2">
						<Button asChild variant="outline" size="sm">
							<Link to={routes.stockGrants}>View all grants</Link>
						</Button>
						<Button asChild variant="outline" size="sm">
							<Link to={routes.settingsOrg}>View program rules</Link>
						</Button>
					</div>
				}
			/>

			{!canViewStock ? (
				<EmptyState
					title="Stock metrics unavailable"
					message="You do not have permission to view the stock dashboard metrics."
				/>
			) : summaryQuery.isLoading ? (
				<StockOverviewSkeleton />
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
						<Card
							key={metric.label}
							style={metricCardStyle}
							className="relative overflow-hidden"
						>
							<div
								className="absolute left-0 top-0 h-full w-1"
								style={{ backgroundColor: colorPalette.semantic.primary }}
							/>
							<CardHeader className="pb-2">
								<CardTitle
									className="text-xs font-semibold uppercase tracking-wide"
									style={metricLabelStyle}
								>
									{metric.label}
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p
									className="text-2xl font-semibold"
									style={metricValueStyle}
								>
									{metric.value}
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</PageContainer>
	);
}

function StockOverviewSkeleton() {
	return (
		<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
			{Array.from({ length: 8 }).map((_, index) => (
				<Card key={`stock-summary-skeleton-${index}`} className="relative overflow-hidden">
					<div className="absolute left-0 top-0 h-full w-1 bg-muted" />
					<CardHeader className="pb-2">
						<Skeleton className="h-3 w-28" />
					</CardHeader>
					<CardContent>
						<Skeleton className="h-7 w-24" />
					</CardContent>
				</Card>
			))}
			<Card>
				<CardHeader className="pb-2">
					<Skeleton className="h-3 w-36" />
				</CardHeader>
				<CardContent>
					<Skeleton className="h-5 w-32" />
				</CardContent>
			</Card>
		</div>
	);
}
