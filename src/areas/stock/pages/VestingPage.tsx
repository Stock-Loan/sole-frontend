import { useMemo } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { usePermissions } from "@/auth/hooks";
import { useAllStockGrants } from "@/entities/stock-grant/hooks";
import { formatShares } from "@/entities/stock-grant/constants";
import { formatDate } from "@/shared/lib/format";
import { useStockSearch } from "@/entities/stock-grant/context/context";
import { StockUserSearch } from "@/entities/stock-grant/components/StockUserSearch";
import type { VestingEventRow } from "@/entities/stock-grant/types";

export function VestingPage() {
	const { can } = usePermissions();
	const { selectedUser } = useStockSearch();

	const canViewGrants = can("stock.view") || can("stock.manage");
	const membershipId = selectedUser?.membership.id ?? "";

	const allGrantsQuery = useAllStockGrants(membershipId, {
		enabled: Boolean(membershipId) && canViewGrants,
	});

	const vestingEvents = useMemo<VestingEventRow[]>(() => {
		const grants = allGrantsQuery.data ?? [];
		return grants
			.flatMap((grant) =>
				(grant.vesting_events ?? []).map((event) => ({
					id: event.id ?? `${grant.id}-${event.vest_date}-${event.shares}`,
					grantId: grant.id,
					grantDate: grant.grant_date,
					status: grant.status,
					vestDate: event.vest_date,
					shares: event.shares,
				})),
			)
			.sort(
				(a, b) =>
					new Date(a.vestDate).getTime() - new Date(b.vestDate).getTime(),
			);
	}, [allGrantsQuery.data]);

	const columns = useMemo<ColumnDefinition<VestingEventRow>[]>(
		() => [
			{
				id: "vestDate",
				header: "Vest date",
				accessor: (event) => event.vestDate,
				cell: (event) => formatDate(event.vestDate),
				headerClassName: "whitespace-nowrap",
			},
			{
				id: "shares",
				header: "Shares",
				accessor: (event) => event.shares,
				cell: (event) => formatShares(event.shares),
				headerClassName: "whitespace-nowrap",
			},
			{
				id: "grantDate",
				header: "Grant date",
				accessor: (event) => event.grantDate,
				cell: (event) => formatDate(event.grantDate),
				headerClassName: "whitespace-nowrap",
			},
			{
				id: "status",
				header: "Status",
				accessor: (event) => event.status,
				headerClassName: "whitespace-nowrap",
			},
			{
				id: "grantId",
				header: "Grant ID",
				accessor: (event) => event.grantId,
				cell: (event) => (
					<span className="text-xs text-muted-foreground">{event.grantId}</span>
				),
				headerClassName: "whitespace-nowrap",
			},
		],
		[],
	);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Vesting"
				subtitle="Review vesting schedules and eligibility controls."
				actions={<StockUserSearch />}
			/>

			{selectedUser ? (
				<div className="flex min-h-0 flex-1 flex-col">
					{!canViewGrants ? (
						<p className="text-sm text-muted-foreground">
							You do not have access to view vesting events.
						</p>
					) : allGrantsQuery.isError ? (
						<div className="flex flex-wrap items-center gap-3 text-sm text-destructive">
							<span>Unable to load vesting events.</span>
							<Button
								variant="outline"
								size="sm"
								onClick={() => allGrantsQuery.refetch()}
							>
								Retry
							</Button>
						</div>
					) : (
						<DataTable
							data={vestingEvents}
							columns={columns}
							getRowId={(event) => event.id}
							isLoading={allGrantsQuery.isLoading}
							emptyMessage="No vesting events found."
							enableRowSelection={false}
							enableExport
							exportFileName="vesting-events.csv"
							className="min-h-0 flex-1"
							pagination={{ enabled: false }}
						/>
					)}
				</div>
			) : (
				<EmptyState
					title="No user selected"
					message="Search for an employee to view details."
				/>
			)}
		</PageContainer>
	);
}
