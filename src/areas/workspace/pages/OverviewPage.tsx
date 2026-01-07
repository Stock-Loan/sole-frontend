import { useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { routes } from "@/shared/lib/routes";
import { formatDate } from "@/shared/lib/format";
import { usePermissions } from "@/auth/hooks";
import { useMeStockSummary } from "@/entities/stock-grant/hooks";
import { formatShares, getEligibilityReasonLabel } from "@/entities/stock-grant/constants";
import { cn } from "@/shared/lib/utils";

export function OverviewPage() {
	const { can } = usePermissions();
	const canViewSelf = can("stock.self.view");
	const summaryQuery = useMeStockSummary({}, { enabled: canViewSelf });

	const summary = summaryQuery.data;
	const eligibility = summary?.eligibility_result;
	const isEligible = eligibility?.eligible_to_exercise;
	const nextVesting = summary?.next_vesting_event;

	const metricCards = summary
		? [
				{
					label: "Total granted shares",
					value: formatShares(summary.total_granted_shares),
				},
				{
					label: "Vested shares",
					value: formatShares(summary.total_vested_shares),
				},
				{
					label: "Unvested shares",
					value: formatShares(summary.total_unvested_shares),
				},
				{
					label: "Next vesting",
					value: nextVesting
						? `${formatDate(nextVesting.vest_date)} (${formatShares(
								nextVesting.shares
						  )})`
						: "—",
				},
		  ]
		: [];

	const reasons =
		eligibility?.reasons?.map((reason) => getEligibilityReasonLabel(reason)) ??
		[];

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="My Workspace"
				subtitle="Overview of your stock grants and vesting status."
			/>

			{!canViewSelf ? (
				<EmptyState
					title="Stock information unavailable"
					message="You do not have permission to view your stock summary."
				/>
			) : summaryQuery.isLoading ? (
				<LoadingState label="Loading your stock summary..." />
			) : summaryQuery.isError ? (
				<EmptyState
					title="Unable to load summary"
					message="We couldn't fetch your stock details right now."
					actionLabel="Retry"
					onRetry={() => summaryQuery.refetch()}
				/>
			) : (
				<div className="space-y-6">
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
					</div>

					{summary && (
						<div
							className={cn(
								"rounded-lg border p-4",
								isEligible
									? "border-emerald-200 bg-emerald-50/60"
									: "border-amber-200 bg-amber-50/60"
							)}
						>
							<div className="flex items-start gap-3">
								{isEligible ? (
									<CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
								) : (
									<AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
								)}
								<div>
									<p className="text-sm font-semibold text-foreground">
										{isEligible
											? "Eligible to exercise"
											: "Not eligible to exercise"}
									</p>
									<p className="text-sm text-muted-foreground">
										{isEligible
											? "You currently meet the requirements to exercise your vested shares."
											: "You are currently blocked from exercising shares."}
									</p>
									{reasons.length ? (
										<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
											{reasons.map((reason) => (
												<li key={reason}>• {reason}</li>
											))}
										</ul>
									) : null}
								</div>
							</div>
						</div>
					)}

					<div className="flex gap-4">
						<Button asChild variant="outline">
							<Link to={routes.stockAdmin}>View all grants</Link>
						</Button>
						<Button asChild variant="outline">
							<Link to={routes.orgSettings}>View program rules</Link>
						</Button>
					</div>
				</div>
			)}
		</PageContainer>
	);
}