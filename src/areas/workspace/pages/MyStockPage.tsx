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
import { colorPalette } from "@/app/styles/color-palette";

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
	const metricCardStyle = {
		borderColor: colorPalette.slate[200],
		backgroundColor: colorPalette.semantic.surface,
	};
	const metricLabelStyle = { color: colorPalette.slate[500] };
	const metricValueStyle = { color: colorPalette.navy[900] };
	const summaryCardStyle = {
		borderColor: colorPalette.slate[200],
		background: colorPalette.gradients.card,
	};
	const eligibleBannerStyle = isEligible
		? {
				borderColor: colorPalette.status.success[100],
				backgroundColor: colorPalette.status.success[50],
		  }
		: {
				borderColor: colorPalette.status.warning[100],
				backgroundColor: colorPalette.status.warning[50],
		  };
	const eligibleIconColor = isEligible
		? colorPalette.status.success[500]
		: colorPalette.status.warning[500];

	return (
		<PageContainer className="space-y-6">
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
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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

					<div className="space-y-4">
						<Card
							style={summaryCardStyle}
							className="border shadow-sm max-w-[380px]"
						>
							<CardHeader className="pb-2">
								<CardTitle
									className="text-xs font-semibold uppercase tracking-wide"
									style={metricLabelStyle}
								>
									Grant value
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm">
								<div className="flex items-center justify-between">
									<span style={metricLabelStyle}>
										Average exercise price
									</span>
									<span className="font-semibold" style={metricValueStyle}>
										{formatCurrency(averageExercisePrice)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span style={metricLabelStyle}>Total stock value</span>
									<span className="font-semibold" style={metricValueStyle}>
										{formatCurrency(totalStockValue)}
									</span>
								</div>
							</CardContent>
						</Card>

						{summary && (
							<div
								className={cn("rounded-xl border p-4 shadow-sm")}
								style={eligibleBannerStyle}
							>
								<div className="flex items-start gap-3">
									{isEligible ? (
										<CheckCircle2
											className="mt-0.5 h-5 w-5"
											style={{ color: eligibleIconColor }}
										/>
									) : (
										<AlertTriangle
											className="mt-0.5 h-5 w-5"
											style={{ color: eligibleIconColor }}
										/>
									)}
									<div>
										<p
											className="text-sm font-semibold"
											style={{ color: colorPalette.navy[900] }}
										>
											{isEligible
												? "Eligible to exercise"
												: "Not eligible to exercise"}
										</p>
										<p
											className="text-sm"
											style={{ color: colorPalette.slate[600] }}
										>
											{isEligible
												? "You currently meet the requirements to exercise your available vested shares."
												: "You are currently blocked from exercising available vested shares."}
										</p>
										{reasons.length ? (
											<ul
												className="mt-2 space-y-1 text-sm"
												style={{ color: colorPalette.slate[600] }}
											>
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
				</div>
			)}
		</PageContainer>
	);
}

function MyStockSkeleton() {
	return (
		<div className="space-y-6">
			<Card className="overflow-hidden">
				<CardContent className="space-y-3 pt-6">
					<Skeleton className="h-3 w-24" />
					<Skeleton className="h-8 w-40" />
					<Skeleton className="h-3 w-64" />
				</CardContent>
			</Card>
			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
				</div>
				<div className="space-y-4">
					<Card className="max-w-[380px]">
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
					<Card>
						<CardContent className="space-y-3 pt-6">
							<Skeleton className="h-4 w-40" />
							<Skeleton className="h-3 w-64" />
							<Skeleton className="h-3 w-48" />
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
