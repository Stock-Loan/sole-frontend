import { Link } from "react-router-dom";
import { useMemo } from "react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { routes } from "@/shared/lib/routes";
import { usePermissions } from "@/auth/hooks";
import { useOrgStockDashboardSummary } from "@/entities/stock-grant/hooks";
import { StockSummaryMetricGrid } from "@/entities/stock-grant/components/StockSummaryMetricGrid";
import { StockSummaryStackedBarCard } from "@/entities/stock-grant/components/StockSummaryStackedBarCard";
import { StockSummaryDonutCard } from "@/entities/stock-grant/components/StockSummaryDonutCard";
import { StockSummaryGaugeCard } from "@/entities/stock-grant/components/StockSummaryGaugeCard";
import { StockSummaryTimelineCard } from "@/entities/stock-grant/components/StockSummaryTimelineCard";
import {
	buildEligibilityDonutItems,
	buildEligibilityGauge,
	buildGrantShareStack,
	buildGrantStatusDonutItems,
	buildGrantStrategyDonutItems,
	buildReservedGauge,
	buildReservedShareStack,
	buildStockSummaryMetrics,
	buildVestingTimelineEvents,
} from "@/entities/stock-grant/utils/summary";

export function StockOverviewPage() {
	const { can } = usePermissions();
	const canViewStock = can("stock.dashboard.view");
	const summaryQuery = useOrgStockDashboardSummary(
		{},
		{ enabled: canViewStock },
	);

	const summary = summaryQuery.data;
	const metrics = useMemo(() => buildStockSummaryMetrics(summary), [summary]);
	const grantShareStack = useMemo(
		() => buildGrantShareStack(summary),
		[summary],
	);
	const reservedShareStack = useMemo(
		() => buildReservedShareStack(summary),
		[summary],
	);
	const eligibilityItems = useMemo(
		() => buildEligibilityDonutItems(summary),
		[summary],
	);
	const grantStatusItems = useMemo(
		() => buildGrantStatusDonutItems(summary),
		[summary],
	);
	const grantStrategyItems = useMemo(
		() => buildGrantStrategyDonutItems(summary),
		[summary],
	);
	const eligibilityGauge = useMemo(
		() => buildEligibilityGauge(summary),
		[summary],
	);
	const reservedGauge = useMemo(() => buildReservedGauge(summary), [summary]);
	const timelineEvents = useMemo(
		() =>
			buildVestingTimelineEvents(summary?.vesting_timeline?.upcoming_events),
		[summary],
	);

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Stock Summary"
				subtitle="Track stock program coverage, vesting trends, and eligibility."
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
				<div className="space-y-6">
					<StockSummaryMetricGrid metrics={metrics} />

					<div className="grid gap-4 lg:grid-cols-2">
						<StockSummaryStackedBarCard
							title="Granted vs vested vs unvested"
							items={grantShareStack}
						/>
						<StockSummaryStackedBarCard
							title="Reserved vs available vested"
							items={reservedShareStack}
							total={summary?.totals.total_vested_shares}
						/>
					</div>

					<div className="grid gap-4 lg:grid-cols-3">
						<StockSummaryDonutCard
							title="Eligibility breakdown"
							items={eligibilityItems}
						/>
						<StockSummaryDonutCard
							title="Grant strategy"
							items={grantStrategyItems}
						/>
						<StockSummaryDonutCard
							title="Grant status"
							items={grantStatusItems}
						/>
					</div>

					<div className="grid gap-4 lg:grid-cols-3">
						{reservedGauge ? (
							<StockSummaryGaugeCard {...reservedGauge} />
						) : (
							<Card>
								<CardHeader className="pb-2">
									<Skeleton className="h-4 w-28" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-32 w-full" />
								</CardContent>
							</Card>
						)}
						{eligibilityGauge ? (
							<StockSummaryGaugeCard {...eligibilityGauge} />
						) : (
							<Card>
								<CardHeader className="pb-2">
									<Skeleton className="h-4 w-28" />
								</CardHeader>
								<CardContent>
									<Skeleton className="h-32 w-full" />
								</CardContent>
							</Card>
						)}
						<StockSummaryTimelineCard
							title="Upcoming vesting events"
							events={timelineEvents}
						/>
					</div>
				</div>
			)}
		</PageContainer>
	);
}

function StockOverviewSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{Array.from({ length: 8 }).map((_, index) => (
					<Card
						key={`stock-summary-skeleton-${index}`}
						className="relative overflow-hidden"
					>
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
					<Card key={`stock-summary-bars-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-40" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-16 w-full" />
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-3">
				{Array.from({ length: 3 }).map((_, index) => (
					<Card key={`stock-summary-donut-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-32" />
						</CardHeader>
						<CardContent className="flex justify-center">
							<Skeleton className="h-40 w-40 rounded-full" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
