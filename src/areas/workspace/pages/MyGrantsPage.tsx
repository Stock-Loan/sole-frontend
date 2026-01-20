import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { usePermissions } from "@/auth/hooks";
import { useMeDashboardSummary } from "@/entities/dashboard/hooks";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import type { DashboardGrantSummary } from "@/entities/dashboard/types";

const columns: ColumnDefinition<DashboardGrantSummary>[] = [
	{
		id: "grantDate",
		header: "Grant date",
		accessor: (grant) => grant.grant_date,
		cell: (grant) => formatDate(grant.grant_date),
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "totalShares",
		header: "Total shares",
		accessor: (grant) => grant.total_shares,
		cell: (grant) => formatShares(grant.total_shares),
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "vestedShares",
		header: "Vested shares",
		accessor: (grant) => grant.vested_shares,
		cell: (grant) => formatShares(grant.vested_shares),
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "unvestedShares",
		header: "Unvested shares",
		accessor: (grant) => grant.unvested_shares,
		cell: (grant) => formatShares(grant.unvested_shares),
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "reservedShares",
		header: "Reserved shares",
		accessor: (grant) => grant.reserved_shares,
		cell: (grant) => formatShares(grant.reserved_shares),
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "availableShares",
		header: "Available vested",
		accessor: (grant) => grant.available_vested_shares,
		cell: (grant) => formatShares(grant.available_vested_shares),
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "exercisePrice",
		header: "Exercise price",
		accessor: (grant) => grant.exercise_price,
		cell: (grant) => formatCurrency(grant.exercise_price),
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "status",
		header: "Status",
		accessor: (grant) => grant.status,
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "vestingStrategy",
		header: "Vesting strategy",
		accessor: (grant) => grant.vesting_strategy,
		headerClassName: "whitespace-nowrap",
	},
	{
		id: "nextVesting",
		header: "Next vesting",
		accessor: (grant) => grant.next_vesting_date ?? "",
		cell: (grant) =>
			grant.next_vesting_date
				? `${formatDate(grant.next_vesting_date)} (${formatShares(
						grant.next_vesting_shares ?? 0,
					)})`
				: "—",
		headerClassName: "whitespace-nowrap",
	},
];

export function MyGrantsPage() {
	const { can } = usePermissions();
	const canViewSelf = can("stock.self.view");
	const summaryQuery = useMeDashboardSummary({}, { enabled: canViewSelf });
	const summary = summaryQuery.data;
	const grants = summary?.grants ?? [];

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="My grants"
				subtitle="Review your grants, vesting progress, and exercise prices."
			/>

			{!canViewSelf ? (
				<EmptyState
					title="Grants unavailable"
					message="You do not have permission to view your grants."
				/>
			) : summaryQuery.isLoading ? (
				<EmptyState title="Loading grants" message="Please wait..." />
			) : summaryQuery.isError ? (
				<EmptyState
					title="Unable to load grants"
					message="We couldn't fetch your grants right now."
					actionLabel="Retry"
					onRetry={() => summaryQuery.refetch()}
				/>
			) : (
				<DataTable
					data={grants}
					columns={columns}
					getRowId={(grant) => grant.grant_id}
					isLoading={summaryQuery.isFetching}
					emptyMessage="No grants found."
					enableRowSelection={false}
					enableExport={false}
					className="min-h-0 flex-1"
					pagination={{ enabled: false }}
				/>
			)}
		</PageContainer>
	);
}
