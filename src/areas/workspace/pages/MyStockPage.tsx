import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { routes } from "@/shared/lib/routes";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { usePermissions } from "@/auth/hooks";
import { useMeStockSummary } from "@/entities/stock-grant/hooks";
import { formatShares, getEligibilityReasonLabel } from "@/entities/stock-grant/constants";
import { getStockValueMetrics } from "@/entities/stock-grant/utils";
import { cn } from "@/shared/lib/utils";

export function MyStockPage() {
	const { can } = usePermissions();
	const canViewSelf = can("stock.self.view");
	const canApplyLoan = can("loan.apply");
	const summaryQuery = useMeStockSummary({}, { enabled: canViewSelf });

	const summary = summaryQuery.data;
	const eligibility = summary?.eligibility_result;
	const isEligible = eligibility?.eligible_to_exercise;
	const nextVesting = summary?.next_vesting_event;
	const { averageExercisePrice, totalStockValue } = getStockValueMetrics(summary);

	const reasons =
		eligibility?.reasons?.map((reason) => getEligibilityReasonLabel(reason)) ??
		[];

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
					label: "Reserved shares",
					value: formatShares(summary.total_reserved_shares),
				},
				{
					label: "Available vested shares",
					value: formatShares(summary.total_available_vested_shares),
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

	const canStartLoan = Boolean(canApplyLoan && isEligible);

	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Overview"
				subtitle="Review your stock grants, vesting, and eligibility details."
				actions={
					canStartLoan ? (
						<Button asChild size="sm">
							<Link to={routes.workspaceLoanWizardNew}>
								Exercise &amp; Finance Options
							</Link>
						</Button>
					) : null
				}
			/>

			{!canViewSelf ? (
				<EmptyState
					title="Stock summary unavailable"
					message="You do not have permission to view your stock summary."
				/>
			) : summaryQuery.isLoading ? (
				<MyStockSkeleton />
			) : summaryQuery.isError ? (
				<EmptyState
					title="Unable to load summary"
					message="We couldn't fetch your stock summary right now."
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
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Grant value
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">
										Average exercise price
									</span>
									<span className="font-semibold text-foreground">
										{formatCurrency(averageExercisePrice)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">Total stock value</span>
									<span className="font-semibold text-foreground">
										{formatCurrency(totalStockValue)}
									</span>
								</div>
							</CardContent>
						</Card>
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
											? "You currently meet the requirements to exercise your available vested shares."
											: "You are currently blocked from exercising available vested shares."}
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
				</div>
			)}
		</PageContainer>
	);
}

function MyStockSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 6 }).map((_, index) => (
					<Card key={`my-stock-skeleton-${index}`}>
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
						<Skeleton className="h-3 w-28" />
					</CardHeader>
					<CardContent className="space-y-2">
						<div className="flex items-center justify-between">
							<Skeleton className="h-3 w-36" />
							<Skeleton className="h-4 w-24" />
						</div>
						<div className="flex items-center justify-between">
							<Skeleton className="h-3 w-28" />
							<Skeleton className="h-4 w-24" />
						</div>
					</CardContent>
				</Card>
			</div>
			<div className="rounded-lg border p-4">
				<div className="flex items-start gap-3">
					<Skeleton className="mt-0.5 h-5 w-5 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-3 w-64" />
						<Skeleton className="h-3 w-48" />
					</div>
				</div>
			</div>
		</div>
	);
}
