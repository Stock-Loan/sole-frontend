import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { usePermissions } from "@/auth/hooks";
import { useMeDashboardSummary } from "@/entities/dashboard/hooks";
import { formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import type { DashboardVestingEvent } from "@/entities/dashboard/types";

const columns: ColumnDefinition<DashboardVestingEvent>[] = [
	{
		id: "vestDate",
		header: "Vest date",
		accessor: (event) => event.vest_date,
		cell: (event) => formatDate(event.vest_date),
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "shares",
		header: "Shares vesting",
		accessor: (event) => event.shares,
		cell: (event) => formatShares(event.shares),
		headerClassName: "whitespace-nowrap",
	},
];

export function MyVestingEventsPage() {
	const { can } = usePermissions();
	const canViewSelf = can("stock.self.view");
	const summaryQuery = useMeDashboardSummary({}, { enabled: canViewSelf });
	const summary = summaryQuery.data;
	const events = summary?.vesting_timeline?.upcoming_events ?? [];

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="My vesting events"
				subtitle="View upcoming vesting dates and share totals."
			/>

			{!canViewSelf ? (
				<EmptyState
					title="Vesting events unavailable"
					message="You do not have permission to view your vesting events."
				/>
			) : summaryQuery.isLoading ? (
				<EmptyState title="Loading vesting events" message="Please wait..." />
			) : summaryQuery.isError ? (
				<EmptyState
					title="Unable to load vesting events"
					message="We couldn't fetch your vesting events right now."
					actionLabel="Retry"
					onRetry={() => summaryQuery.refetch()}
				/>
			) : (
				<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
					<div className="border-b border-border/70 px-6 py-4">
						<div className="space-y-1">
							<h2 className="text-md font-semibold text-foreground">
								Upcoming vesting events
							</h2>
							<p className="text-sm text-muted-foreground">
								Based on your current grants and vesting schedules.
							</p>
						</div>
					</div>
					<div className="min-h-0 flex-1 px-6 pb-6 pt-4">
						<DataTable
							data={events}
							columns={columns}
							getRowId={(event) => `${event.vest_date}-${event.shares}`}
							isLoading={summaryQuery.isFetching}
							emptyMessage="No upcoming vesting events."
							enableRowSelection={false}
							enableExport={false}
							className="min-h-0 flex-1"
							pagination={{ enabled: false }}
						/>
					</div>
				</div>
			)}
		</PageContainer>
	);
}
