import { AlertTriangle, Bell, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { routes } from "@/shared/lib/routes";
import { formatCurrency, formatDate, formatPercent } from "@/shared/lib/format";
import { usePermissions } from "@/auth/hooks";
import { useMeDashboardSummary } from "@/entities/dashboard/hooks";
import {
	formatShares,
	getEligibilityReasonLabel,
} from "@/entities/stock-grant/constants";
import type { EligibilityReason } from "@/entities/stock-grant/types";
import { cn } from "@/shared/lib/utils";
import { colorPalette } from "@/app/styles/color-palette";
import { StockSummaryDonutCard } from "@/entities/stock-grant/components/StockSummaryDonutCard";
import { StockSummaryGaugeCard } from "@/entities/stock-grant/components/StockSummaryGaugeCard";
import { StockSummaryTimelineCard } from "@/entities/stock-grant/components/StockSummaryTimelineCard";
import { LoanSummaryBarChart } from "@/entities/loan/components/loan-pages/LoanSummaryBarChart";
import { LoanStatusBadge } from "@/entities/loan/components/loan-pages/LoanStatusBadge";
import { getDashboardStockValueMetrics } from "@/entities/dashboard/utils";

export function MyStockPage() {
	const { can } = usePermissions();
	const canViewSelf = can("stock.self.view");
	const canApplyLoan = can("loan.apply");
	const summaryQuery = useMeDashboardSummary({}, { enabled: canViewSelf });

	const summary = summaryQuery.data;
	const attention = summary?.attention;
	const stockTotals = summary?.stock_totals;
	const eligibility = summary?.stock_eligibility;
	const vestingTimeline = summary?.vesting_timeline;
	const grantMix = summary?.grant_mix;
	const reservations = summary?.reservations;
	const loanSummary = summary?.loan_summary;
	const repaymentActivity = summary?.repayment_activity;
	const profileCompletion = summary?.profile_completion;
	const nextPaymentDate = loanSummary?.next_payment_date ?? null;
	const nextPaymentAmount = loanSummary?.next_payment_amount ?? null;
	const isEligible = eligibility?.eligible_to_exercise;
	const nextVestingDate = vestingTimeline?.next_vesting_date ?? null;
	const nextVestingShares = vestingTimeline?.next_vesting_shares ?? null;
	const { averageExercisePriceLabel, totalStockValueLabel } =
		getDashboardStockValueMetrics(summary);

	const attentionItems: Array<{
		action_type: string;
		label: string;
		due_date?: string | null;
		related_id?: string | null;
		sublabel?: string;
	}> = attention?.pending_actions ? [...attention.pending_actions] : [];

	if (
		loanSummary?.has_83b_election === false &&
		loanSummary?.days_until_83b_due !== null &&
		loanSummary?.days_until_83b_due !== undefined
	) {
		let dueDate: string | null = null;
		if (summary?.as_of_date) {
			const baseDate = new Date(summary.as_of_date);
			if (!Number.isNaN(baseDate.getTime())) {
				baseDate.setDate(
					baseDate.getDate() + Number(loanSummary.days_until_83b_due),
				);
				dueDate = baseDate.toISOString().slice(0, 10);
			}
		}
		const loanAmountLabel = formatCurrency(
			loanSummary?.principal ?? loanSummary?.remaining_balance ?? null,
		);
		const sublabel =
			loanAmountLabel && loanAmountLabel !== "—"
				? `83B election on ${loanAmountLabel} loan`
				: "83B election on your active loan";
		attentionItems.push({
			action_type: "83B_ELECTION",
			label: "83B election filing pending",
			sublabel,
			due_date: dueDate,
			related_id: loanSummary?.active_loan_id ?? undefined,
		});
	}

	const missedPaymentCount = loanSummary?.missed_payment_count ?? 0;
	if (missedPaymentCount > 0) {
		const missedAmountLabel = formatCurrency(
			loanSummary?.missed_payment_amount_total ?? null,
		);
		const missedDates = loanSummary?.missed_payment_dates ?? [];
		const lastMissedDate =
			missedDates.length > 0 ? missedDates[missedDates.length - 1] : null;
		const missedSubLabelParts = [
			`Missed ${missedPaymentCount} payment${missedPaymentCount === 1 ? "" : "s"}`,
			missedAmountLabel !== "—" ? missedAmountLabel : null,
			lastMissedDate ? `Last on ${formatDate(lastMissedDate)}` : null,
		].filter(Boolean);
		attentionItems.push({
			action_type: "MISSED_PAYMENT",
			label: "Missed payment alert",
			sublabel: missedSubLabelParts.join(" • "),
			related_id: loanSummary?.active_loan_id ?? undefined,
		});
	}

	const attentionPendingCount = attentionItems.length;
	const unreadAnnouncementsCount = attention?.unread_announcements_count ?? 0;
	const showAttentionCard = Boolean(attention || attentionItems.length > 0);

	const profileFieldLabels: Record<string, string> = {
		preferred_name: "Preferred name",
		phone_number: "Phone number",
		timezone: "Timezone",
		marital_status: "Marital status",
		country: "Country",
		state: "State",
		address_line1: "Address line 1",
		address_line2: "Address line 2",
		postal_code: "Postal code",
	};
	const profileMissingLabels =
		profileCompletion?.missing_fields?.map(
			(field) => profileFieldLabels[field] ?? field,
		) ?? [];
	const profileCompletionPercent = profileCompletion?.completion_percent ?? 100;
	const showProfileCompletion =
		Boolean(profileCompletion) && !profileCompletion?.is_complete;

	const reasons =
		eligibility?.reasons?.map((reason) =>
			getEligibilityReasonLabel(reason as EligibilityReason),
		) ?? [];

	const nextPaymentLabel =
		nextPaymentDate || nextPaymentAmount
			? [
					nextPaymentDate ? formatDate(nextPaymentDate) : null,
					nextPaymentAmount ? formatCurrency(nextPaymentAmount) : null,
				]
					.filter(Boolean)
					.join(" • ")
			: "—";

	const metricCards = stockTotals
		? [
				{
					label: "Grant count",
					value: stockTotals.grant_count.toLocaleString(),
				},
				{
					label: "Total granted shares",
					value: formatShares(stockTotals.total_granted_shares),
				},
				{
					label: "Vested shares",
					value: formatShares(stockTotals.total_vested_shares),
				},
				{
					label: "Reserved shares",
					value: formatShares(stockTotals.total_reserved_shares),
				},
				{
					label: "Available vested shares",
					value: formatShares(stockTotals.total_available_vested_shares),
				},
				{
					label: "Unvested shares",
					value: formatShares(stockTotals.total_unvested_shares),
				},
				{
					label: "Total loan balance",
					value: formatCurrency(loanSummary?.remaining_balance ?? null),
					meta:
						loanSummary?.principal_remaining || loanSummary?.interest_remaining
							? [
									{
										label: "Principal",
										value: formatCurrency(
											loanSummary?.principal_remaining ?? null,
										),
									},
									{
										label: "Interest",
										value: formatCurrency(
											loanSummary?.interest_remaining ?? null,
										),
									},
								]
							: undefined,
				},
				{
					label: "Next payment",
					value: nextPaymentLabel,
				},
				{
					label: "Next vesting",
					value: nextVestingDate
						? `${formatDate(nextVestingDate)} (${formatShares(
								nextVestingShares ?? 0,
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

	const grantStatusItems = grantMix?.by_status
		? Object.entries(grantMix.by_status).map(([label, value]) => ({
				label,
				value,
			}))
		: [];
	const grantStrategyItems = grantMix?.by_vesting_strategy
		? Object.entries(grantMix.by_vesting_strategy).map(([label, value]) => ({
				label,
				value,
			}))
		: [];
	const reservedByStatusItems = reservations?.reserved_by_status
		? Object.entries(reservations.reserved_by_status).map(([label, value]) => ({
				label,
				value,
			}))
		: [];
	const reservedPercent = reservations?.reserved_share_percent_of_vested
		? Number(reservations.reserved_share_percent_of_vested)
		: 0;
	const repaymentItems =
		repaymentActivity?.repayment_history?.map((item) => ({
			label: formatDate(item.payment_date),
			value: Number(item.amount ?? 0),
		})) ?? [];
	const vestedByMonthItems =
		vestingTimeline?.vested_by_month?.map((item) => ({
			label: item.month,
			value: item.shares ?? 0,
		})) ?? [];

	return (
		<PageContainer className="space-y-8">
			<PageHeader
				title="Overview"
				subtitle="Review your dashboard, stock activity, and loan status."
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
					message="You do not have permission to view your dashboard summary."
				/>
			) : summaryQuery.isLoading ? (
				<MyStockSkeleton />
			) : summaryQuery.isError ? (
				<EmptyState
					title="Unable to load summary"
					message="We couldn't fetch your dashboard summary right now."
					actionLabel="Retry"
					onRetry={() => summaryQuery.refetch()}
				/>
			) : (
				<div className="space-y-8">
					{showProfileCompletion ? (
						<Card className="border-amber-200 bg-amber-50/70">
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-900">
									<AlertTriangle className="h-4 w-4" />
									Complete your profile
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm text-amber-900">
								<p>
									Your profile is {profileCompletionPercent}% complete. Please
									fill the remaining details to keep your records up to date.
								</p>
								{profileMissingLabels.length > 0 ? (
									<p className="text-xs text-amber-800">
										Missing: {profileMissingLabels.join(", ")}
									</p>
								) : null}
								<div className="h-2 w-full rounded-full bg-amber-100">
									<div
										className="h-2 rounded-full bg-amber-400"
										style={{ width: `${profileCompletionPercent}%` }}
									/>
								</div>
								<Button asChild size="sm" className="w-fit">
									<Link to={routes.workspaceSettings}>Update profile</Link>
								</Button>
							</CardContent>
						</Card>
					) : null}
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{metricCards.map((metric) => (
							<Card
								key={metric.label}
								style={metricCardStyle}
								className="relative overflow-hidden rounded-2xl border border-border/60 bg-card/70 shadow-sm"
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
									{metric.label === "Total granted shares" ? (
										<Link
											to={routes.workspaceGrants}
											className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
										>
											See grants
										</Link>
									) : null}
									{metric.label === "Next vesting" ? (
										<Link
											to={routes.workspaceVestingEvents}
											className="absolute right-3 top-3 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary"
										>
											View all events
										</Link>
									) : null}
								</CardHeader>
								<CardContent>
									<div className="flex items-start justify-between gap-3">
										<p
											className="text-2xl font-semibold"
											style={metricValueStyle}
										>
											{metric.value}
										</p>
										{metric.meta ? (
											<div className="space-y-1 text-right text-xs text-slate-500">
												{metric.meta.map((item) => (
													<div key={item.label}>
														<span className="uppercase">{item.label}</span>
														<span className="ml-2 font-semibold text-slate-700">
															{item.value}
														</span>
													</div>
												))}
											</div>
										) : null}
									</div>
								</CardContent>
							</Card>
						))}
					</div>

					<div
						className={cn(
							"grid gap-4",
							showAttentionCard ? "md:grid-cols-2" : "",
						)}
					>
						<div className="flex flex-col gap-4">
							<Card
								style={summaryCardStyle}
								className="w-full rounded-2xl border border-border/60 shadow-sm"
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
										<span style={metricLabelStyle}>Average exercise price</span>
										<span className="font-semibold" style={metricValueStyle}>
											{averageExercisePriceLabel}
										</span>
									</div>
									<div className="flex items-center justify-between">
										<span style={metricLabelStyle}>Total stock value</span>
										<span className="font-semibold" style={metricValueStyle}>
											{totalStockValueLabel}
										</span>
									</div>
								</CardContent>
							</Card>

							{summary && (
								<div
									className={cn(
										"rounded-2xl border border-border/60 p-4 shadow-sm",
									)}
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

						{showAttentionCard ? (
							<Card className="relative overflow-hidden rounded-2xl border border-amber-200/60 bg-amber-50/70 shadow-sm">
								<div className="absolute left-0 top-0 h-full w-1 bg-amber-500" />
								<span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-900">
									<span className="h-2 w-2 rounded-full bg-amber-500" />
									Needs attention
								</span>
								<CardHeader className="pb-2">
									<CardTitle className="flex items-center gap-2 text-sm font-semibold text-amber-900">
										<span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600">
											<Bell className="h-4 w-4" />
										</span>
										Attention
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3 text-sm text-amber-900/80">
									<div className="flex flex-wrap items-center gap-4">
										<div>
											<p className="text-xs uppercase text-amber-700">
												Unread announcements
											</p>
											<p className="text-lg font-semibold text-amber-950">
												{unreadAnnouncementsCount.toLocaleString()}
											</p>
										</div>
										<div>
											<p className="text-xs uppercase text-amber-700">
												Pending actions
											</p>
											<p className="text-lg font-semibold text-amber-950">
												{attentionPendingCount.toLocaleString()}
											</p>
										</div>
									</div>
									{attentionItems.length ? (
										<ul className="grid gap-2 sm:grid-cols-2">
											{attentionItems.map((action) => (
												<li
													key={`${action.action_type}-${action.related_id ?? action.label}`}
													className="flex h-full flex-col gap-2 rounded-xl border border-amber-200/70 bg-white/80 px-3 py-2"
												>
													<div className="flex items-start justify-between gap-3">
														<div className="space-y-0.5">
															<p className="text-sm font-semibold text-amber-950">
																{action.label}
															</p>
															<p className="text-xs text-amber-700">
																{action.sublabel ?? action.action_type}
															</p>
														</div>
														<span className="text-xs text-amber-700">
															{action.due_date
																? `Due ${formatDate(action.due_date)}`
																: "No due date"}
														</span>
													</div>
												</li>
											))}
										</ul>
									) : (
										<p className="text-xs text-amber-700">
											No pending actions right now.
										</p>
									)}
								</CardContent>
							</Card>
						) : null}
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<StockSummaryDonutCard
							title="Grant status"
							items={grantStatusItems}
						/>
						<StockSummaryDonutCard
							title="Vesting strategy"
							items={grantStrategyItems}
						/>
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<StockSummaryTimelineCard
							title="Upcoming vesting"
							events={vestingTimeline?.upcoming_events ?? []}
						/>
						<LoanSummaryBarChart
							title="Vested by month"
							items={vestedByMonthItems}
							emptyMessage="No vesting activity yet."
						/>
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<StockSummaryGaugeCard
							title="Reserved shares of vested"
							value={Number.isFinite(reservedPercent) ? reservedPercent : 0}
							helper={
								reservations?.reserved_share_percent_of_vested
									? `${formatPercent(reservations.reserved_share_percent_of_vested)} reserved`
									: "No reservations recorded."
							}
						/>
						<StockSummaryDonutCard
							title="Reservations by status"
							items={reservedByStatusItems}
							emptyMessage="No reservations yet."
						/>
					</div>

					<div className="grid gap-4 lg:grid-cols-2">
						<Card className="h-full rounded-2xl border border-border/60 bg-card/70 shadow-sm">
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-semibold">
									Loan summary
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm text-muted-foreground">
								<div className="flex items-center justify-between">
									<span>Status</span>
									<span className="font-semibold text-foreground">
										{loanSummary?.status ? (
											<LoanStatusBadge status={loanSummary.status} />
										) : (
											"—"
										)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Active loans</span>
									<span className="font-semibold text-foreground">
										{loanSummary?.active_loans_count ?? 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Pending loans</span>
									<span className="font-semibold text-foreground">
										{loanSummary?.pending_loans_count ?? 0}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Principal</span>
									<span className="font-semibold text-foreground">
										{formatCurrency(loanSummary?.principal ?? null)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Remaining balance</span>
									<span className="font-semibold text-foreground">
										{formatCurrency(loanSummary?.remaining_balance ?? null)}
									</span>
								</div>
								{loanSummary?.active_loan_id ? (
									<Button asChild size="sm" className="w-full">
										<Link
											to={routes.workspaceLoanDetail.replace(
												":id",
												loanSummary.active_loan_id,
											)}
										>
											View active loan
										</Link>
									</Button>
								) : null}
							</CardContent>
						</Card>

						<LoanSummaryBarChart
							title="Recent payments"
							items={repaymentItems}
							emptyMessage="No repayments recorded."
							className="h-full rounded-2xl border border-border/60 bg-card/70 shadow-sm"
							chartHeightClassName="h-24"
							summary={
								<div className="flex items-center justify-between mb-3">
									<span>Last payment</span>
									<span className="font-semibold text-foreground">
										{repaymentActivity?.last_payment_date
											? `${formatDate(
													repaymentActivity.last_payment_date,
												)} • ${formatCurrency(
													repaymentActivity.last_payment_amount ?? null,
												)}`
											: "—"}
									</span>
								</div>
							}
						/>
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
