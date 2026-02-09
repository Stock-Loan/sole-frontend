import { Badge } from "@/shared/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/Table/table";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import { normalizeDisplay } from "@/shared/lib/utils";
import type {
	StockGrantDetailGridProps,
	StockGrantDetailItem,
	StockGrantDetailProps,
} from "@/entities/stock-grant/types";

function DetailGrid({ items }: StockGrantDetailGridProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{items.map((item) => (
				<div key={item.label} className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{item.label}
					</p>
					<p className="text-sm text-foreground">{item.value || "—"}</p>
				</div>
			))}
		</div>
	);
}

export function StockGrantDetail({
	grant,
	isLoading,
	isError,
	onRetry,
	showOrgFields = false,
}: StockGrantDetailProps) {
	if (isLoading) {
		return <StockGrantDetailSkeleton />;
	}

	if (isError || !grant) {
		return (
			<EmptyState
				title="Unable to load grant"
				message="We couldn't fetch this grant right now."
				actionLabel={onRetry ? "Retry" : undefined}
				onRetry={onRetry}
			/>
		);
	}

	const nextVesting =
		grant.next_vesting_event?.vest_date && grant.next_vesting_event?.shares
			? `${formatDate(grant.next_vesting_event.vest_date)} (${formatShares(
					grant.next_vesting_event.shares,
				)})`
			: "—";

	const summaryItems: StockGrantDetailItem[] = [
		{ label: "Grant date", value: formatDate(grant.grant_date) },
		{ label: "Total shares", value: formatShares(grant.total_shares) },
		{
			label: "Exercise price",
			value: grant.exercise_price
				? formatCurrency(grant.exercise_price)
				: "—",
		},
		{ label: "Status", value: normalizeDisplay(grant.status) },
		{
			label: "Vesting strategy",
			value: normalizeDisplay(grant.vesting_strategy),
		},
		{ label: "Next vesting", value: nextVesting },
		{
			label: "Vested shares",
			value:
				grant.vested_shares === undefined || grant.vested_shares === null
					? "—"
					: formatShares(grant.vested_shares),
		},
		{
			label: "Unvested shares",
			value:
				grant.unvested_shares === undefined || grant.unvested_shares === null
					? "—"
					: formatShares(grant.unvested_shares),
		},
		{
			label: "Reserved shares",
			value:
				grant.reserved_shares === undefined || grant.reserved_shares === null
					? "—"
					: formatShares(grant.reserved_shares),
		},
		{
			label: "Available vested",
			value:
				grant.available_vested_shares === undefined ||
				grant.available_vested_shares === null
					? "—"
					: formatShares(grant.available_vested_shares),
		},
	];

	if (showOrgFields) {
		summaryItems.push(
			{ label: "Org ID", value: grant.org_id ?? "—" },
			{
				label: "Membership ID",
				value: grant.org_membership_id ?? "—",
			},
		);
	}

	const vestingEvents = grant.vesting_events ?? [];

	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">Grant summary</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex flex-wrap items-center gap-2">
						<Badge
							variant="secondary"
							className={
								grant.status === "ACTIVE"
									? "border-emerald-200 bg-emerald-50 text-emerald-700"
									: grant.status === "EXERCISED_OUT"
										? "border-amber-200 bg-amber-50 text-amber-700"
										: "border-border bg-muted text-muted-foreground"
							}
						>
							{grant.status}
						</Badge>
						<span className="text-xs text-muted-foreground">
							Grant ID: {grant.id}
						</span>
					</div>
					<DetailGrid items={summaryItems} />
					{grant.notes ? (
						<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
							<p className="font-semibold text-foreground">Notes</p>
							<p className="mt-1">{grant.notes}</p>
						</div>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">
						Vesting events
					</CardTitle>
				</CardHeader>
				<CardContent>
					{vestingEvents.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							No vesting events for this grant.
						</p>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="whitespace-nowrap">
										Vest date
									</TableHead>
									<TableHead className="whitespace-nowrap">
										Shares
									</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{vestingEvents.map((event) => (
									<TableRow key={event.id ?? event.vest_date}>
										<TableCell>{formatDate(event.vest_date)}</TableCell>
										<TableCell>{formatShares(event.shares)}</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function StockGrantDetailSkeleton() {
	return (
		<div className="space-y-4">
			<Card>
				<CardHeader className="pb-2">
					<Skeleton className="h-5 w-32" />
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center gap-2">
						<Skeleton className="h-6 w-24 rounded-full" />
						<Skeleton className="h-4 w-44" />
					</div>
					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
						{Array.from({ length: 9 }).map((_, index) => (
							<div
								key={`stock-grant-summary-skeleton-${index}`}
								className="space-y-2"
							>
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-4 w-32" />
							</div>
						))}
					</div>
					<Skeleton className="h-16 w-full" />
				</CardContent>
			</Card>
			<Card>
				<CardHeader className="pb-2">
					<Skeleton className="h-5 w-28" />
				</CardHeader>
				<CardContent className="space-y-2">
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton
							key={`stock-grant-events-skeleton-${index}`}
							className="h-10 w-full"
						/>
					))}
				</CardContent>
			</Card>
		</div>
	);
}
