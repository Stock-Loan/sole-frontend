import { useMemo } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/Table/table";
import { usePermissions } from "@/auth/hooks";
import { useAllStockGrants } from "@/entities/stock-grant/hooks";
import { formatShares } from "@/entities/stock-grant/constants";
import { formatDate } from "@/shared/lib/format";
import { useStockSearch } from "../context/StockSearchContext";
import { StockUserSearch } from "../components/StockUserSearch";

export function VestingPage() {
	const { can } = usePermissions();
	const { selectedUser } = useStockSearch();

	const canViewGrants = can("stock.grant.view") || can("stock.grant.manage");
	const membershipId = selectedUser?.membership.id ?? "";

	const allGrantsQuery = useAllStockGrants(membershipId, {
		enabled: Boolean(membershipId) && canViewGrants,
	});

	const vestingEvents = useMemo(() => {
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
				}))
			)
			.sort((a, b) =>
				new Date(a.vestDate).getTime() - new Date(b.vestDate).getTime()
			);
	}, [allGrantsQuery.data]);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Vesting"
				subtitle="Review vesting schedules and eligibility controls."
				actions={<StockUserSearch />}
			/>

			{selectedUser ? (
				<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
					<div className="border-b border-border/70 px-6 py-4">
						<div className="space-y-1">
							<p className="text-sm font-semibold text-foreground">
								Vesting events
							</p>
							<p className="text-xs text-muted-foreground">
								All scheduled vesting events across this employee's grants.
							</p>
						</div>
					</div>
					<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
						{!canViewGrants ? (
							<p className="text-sm text-muted-foreground">
								You do not have access to view vesting events.
							</p>
						) : allGrantsQuery.isLoading ? (
							<p className="text-sm text-muted-foreground">
								Loading vesting events…
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
						) : vestingEvents.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No vesting events found.
							</p>
						) : (
							<Table containerClassName="rounded-md border border-border/60">
								<TableHeader>
									<TableRow>
										<TableHead>Vest date</TableHead>
										<TableHead>Shares</TableHead>
										<TableHead>Grant date</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Grant ID</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{vestingEvents.map((event) => (
										<TableRow key={event.id}>
											<TableCell>{formatDate(event.vestDate)}</TableCell>
											<TableCell>{formatShares(event.shares)}</TableCell>
											<TableCell>{formatDate(event.grantDate)}</TableCell>
											<TableCell>{event.status}</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{event.grantId}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>
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