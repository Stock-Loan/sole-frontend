import { useMemo } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/badge";
import { Skeleton } from "@/shared/ui/Skeleton";
import { getOrgUserDisplayName } from "@/entities/user/constants";
import { usePermissions } from "@/auth/hooks";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { cn } from "@/shared/lib/utils";
import { routes } from "@/shared/lib/routes";
import { useStockSummary } from "@/entities/stock-grant/hooks";
import {
	formatShares,
	getEligibilityReasonLabel,
} from "@/entities/stock-grant/constants";
import { getStockValueMetrics } from "@/entities/stock-grant/utils";
import type { StockSummaryMetric } from "@/entities/stock-grant/types";
import { useStockSearch } from "@/entities/stock-grant/context/context";
import { StockUserSearch } from "../../../entities/stock-grant/components/StockUserSearch";
import { colorPalette } from "@/app/styles/color-palette";

export function StockAdminPage() {
	const { can } = usePermissions();
	const { selectedUser } = useStockSearch();

	const canViewSummary = can(["stock.vesting.view", "stock.eligibility.view"]);

	const membershipId = selectedUser?.membership.id ?? "";

	const summaryQuery = useStockSummary(
		membershipId,
		{},
		{
			enabled: Boolean(membershipId) && canViewSummary,
		}
	);

	const summaryMetrics = useMemo<StockSummaryMetric[]>(() => {
		if (!summaryQuery.data) return [];
		const summary = summaryQuery.data;
		return [
			{
				label: "Total granted shares",
				value: formatShares(summary.total_granted_shares),
			},
			{
				label: "Total vested shares",
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
				label: "Total unvested shares",
				value: formatShares(summary.total_unvested_shares),
			},
		];
	}, [summaryQuery.data]);

	const displayName = selectedUser
		? getOrgUserDisplayName(selectedUser.user)
		: "";
	const userDetailPath = selectedUser
		? routes.peopleUserDetail.replace(
				":membershipId",
				selectedUser.membership.id
		  )
		: "";
	const userInitials = useMemo(() => {
		if (!selectedUser) return "U";
		const nameSource = displayName || selectedUser.user.email || "";
		const parts = nameSource
			.split(" ")
			.map((part) => part.trim())
			.filter(Boolean);
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		if (parts.length === 1) {
			return parts[0].slice(0, 2).toUpperCase();
		}
		return selectedUser.user.email?.slice(0, 2)?.toUpperCase() || "U";
	}, [displayName, selectedUser]);

	const statusChips = selectedUser
		? ([
				{
					label: "Employment",
					value: selectedUser.membership.employment_status,
				},
				{ label: "Platform", value: selectedUser.membership.platform_status },
				selectedUser.membership.invitation_status
					? {
							label: "Invitation",
							value: selectedUser.membership.invitation_status,
					  }
					: null,
		  ].filter(Boolean) as { label: string; value?: string | null }[])
		: [];

	const metaItems = selectedUser
		? [
				{
					label: "Employee ID",
					value: selectedUser.membership.employee_id ?? "—",
				},
				{
					label: "Department",
					value:
						selectedUser.membership.department_name ||
						selectedUser.membership.department ||
						"—",
				},
				{
					label: "Membership created",
					value: formatDate(selectedUser.membership.created_at) || "—",
				},
		  ]
		: [];

	const renderSummaryContent = () => {
		if (!canViewSummary) {
			return (
				<p className="text-sm text-muted-foreground">
					You do not have access to view stock summaries.
				</p>
			);
		}

		if (summaryQuery.isLoading) {
			return <StockSummarySkeleton />;
		}

		if (summaryQuery.isError || !summaryQuery.data) {
			return (
				<div className="flex flex-wrap items-center gap-3 text-sm text-destructive">
					<span>Unable to load stock summary.</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => summaryQuery.refetch()}
					>
						Retry
					</Button>
				</div>
			);
		}

		const summary = summaryQuery.data;
		const eligibility = summary.eligibility_result;
		const isEligible = eligibility.eligible_to_exercise;
		const reasons =
			eligibility.reasons?.map((reason) => getEligibilityReasonLabel(reason)) ??
			[];
		const { averageExercisePrice, totalStockValue } = getStockValueMetrics(
			summary
		);
		const nextVestingLabel = summary.next_vesting_event
			? `${formatDate(summary.next_vesting_event.vest_date)} • ${formatShares(
					summary.next_vesting_event.shares
			  )} shares`
			: "—";
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

		return (
			<div className="space-y-5">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{summaryMetrics.map((metric) => (
						<div
							key={metric.label}
							className="relative overflow-hidden rounded-xl border p-4"
							style={metricCardStyle}
						>
							<div
								className="absolute left-0 top-0 h-full w-1"
								style={{ backgroundColor: colorPalette.semantic.primary }}
							/>
							<p
								className="text-xs font-semibold uppercase tracking-wide"
								style={metricLabelStyle}
							>
								{metric.label}
							</p>
							<p className="mt-2 text-lg font-semibold" style={metricValueStyle}>
								{metric.value}
							</p>
						</div>
					))}
					<div className="rounded-xl border p-4" style={summaryCardStyle}>
						<p
							className="text-xs font-semibold uppercase tracking-wide"
							style={metricLabelStyle}
						>
							Grant value
						</p>
						<div className="mt-3 space-y-2 text-sm">
							<div className="flex items-center justify-between" style={metricLabelStyle}>
								<span>Average exercise price</span>
								<span className="font-semibold" style={metricValueStyle}>
									{formatCurrency(averageExercisePrice)}
								</span>
							</div>
							<div className="flex items-center justify-between" style={metricLabelStyle}>
								<span>Total stock value</span>
								<span className="font-semibold" style={metricValueStyle}>
									{formatCurrency(totalStockValue)}
								</span>
							</div>
						</div>
					</div>
				</div>

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
									? "This employee can currently exercise their available vested shares."
									: "This employee is currently blocked from exercising available vested shares."}
							</p>
							{reasons.length ? (
								<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
									{reasons.map((reason) => (
										<li key={reason}>• {reason}</li>
									))}
								</ul>
							) : (
								<p className="mt-2 text-sm text-muted-foreground">
									No blocking reasons reported.
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-border/60 bg-card/70 p-4">
					<p
						className="text-xs font-semibold uppercase tracking-wide"
						style={metricLabelStyle}
					>
						Next vesting event
					</p>
					<p className="mt-2 text-sm" style={metricValueStyle}>
						{nextVestingLabel}
					</p>
				</div>
			</div>
		);
	};

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Stock administration"
				subtitle="Search employees to review their stock summary."
				actions={<StockUserSearch />}
			/>

			{selectedUser ? (
				<>
					<div className="rounded-lg border border-border/60 bg-card px-5 py-4 shadow-sm">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
									{userInitials}
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Currently viewing
									</p>
									<p className="text-lg font-semibold text-foreground">
										{displayName}
									</p>
									<p className="text-sm text-muted-foreground">
										{selectedUser.user.email}
									</p>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{statusChips.map((chip) => (
									<Badge key={chip.label} variant="secondary">
										{chip.label}: {chip.value || "—"}
									</Badge>
								))}
								<Button asChild size="sm" variant="outline">
									<Link to={userDetailPath}>View user</Link>
								</Button>
							</div>
						</div>
						<div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
							{metaItems.map((item) => (
								<div key={item.label} className="space-y-1">
									<p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
										{item.label}
									</p>
									<p className="text-sm text-foreground">{item.value}</p>
								</div>
							))}
						</div>
					</div>

					<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
						<div className="flex min-h-0 flex-1 flex-col">
							<div className="border-b border-border/70 px-6 py-4">
								<h2 className="text-lg font-semibold">Stock Summary</h2>
								<p className="text-sm text-muted-foreground">
									Eligibility, vesting totals, and next events.
								</p>
							</div>
							<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
								{renderSummaryContent()}
							</div>
						</div>
					</div>
				</>
			) : (
				<EmptyState
					title="No user selected"
					message="Search for an employee to view details."
				/>
			)}
		</PageContainer>
	);
}

function StockSummarySkeleton() {
	return (
		<div className="space-y-5">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={`summary-metric-skeleton-${index}`}
						className="rounded-lg border border-border/60 bg-card/70 p-4"
					>
						<Skeleton className="h-3 w-28" />
						<Skeleton className="mt-3 h-5 w-24" />
					</div>
				))}
				<div className="rounded-lg border border-border/60 bg-card/70 p-4">
					<Skeleton className="h-3 w-28" />
					<div className="mt-3 space-y-2">
						<div className="flex items-center justify-between">
							<Skeleton className="h-3 w-32" />
							<Skeleton className="h-3 w-20" />
						</div>
						<div className="flex items-center justify-between">
							<Skeleton className="h-3 w-24" />
							<Skeleton className="h-3 w-20" />
						</div>
					</div>
				</div>
			</div>
			<div className="rounded-lg border border-border/60 bg-card/70 p-4">
				<div className="flex items-start gap-3">
					<Skeleton className="mt-0.5 h-5 w-5 rounded-full" />
					<div className="flex-1 space-y-2">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="h-3 w-64" />
						<Skeleton className="h-3 w-52" />
						<div className="space-y-1 pt-2">
							<Skeleton className="h-3 w-44" />
							<Skeleton className="h-3 w-36" />
						</div>
					</div>
				</div>
			</div>
			<div className="rounded-lg border border-border/60 bg-card/70 p-4">
				<Skeleton className="h-3 w-36" />
				<Skeleton className="mt-3 h-4 w-48" />
			</div>
		</div>
	);
}
