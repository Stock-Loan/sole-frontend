import { useRef } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { usePermissions } from "@/auth/hooks";
import { StockGrantsSection } from "@/entities/stock-grant/components/StockGrantsSection";
import { useStockSummary } from "@/entities/stock-grant/hooks";
import type { StockGrantsSectionHandle } from "@/entities/stock-grant/types";
import { useStockSearch } from "../context/StockSearchContext";
import { StockUserSearch } from "../components/StockUserSearch";

export function GrantsPage() {
	const { can } = usePermissions();
	const { selectedUser } = useStockSearch();
	const grantsRef = useRef<StockGrantsSectionHandle>(null);

	const canViewGrants = can("stock.grant.view") || can("stock.grant.manage");
	const canManageGrants = can("stock.grant.manage");

	const membershipId = selectedUser?.membership.id ?? "";

	const summaryQuery = useStockSummary(
		membershipId,
		{},
		{
			enabled: Boolean(membershipId) && canViewGrants,
		}
	);

	const membership = selectedUser?.membership;
	const isUserActive =
		membership?.employment_status?.toUpperCase() === "ACTIVE" &&
		membership?.platform_status?.toUpperCase() === "ACTIVE" &&
		membership?.invitation_status?.toUpperCase() === "ACCEPTED";

	const isGrantActionBlocked = !isUserActive;

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Grants"
				subtitle="Manage equity grants across the organization."
				actions={<StockUserSearch />}
			/>

			{selectedUser ? (
				<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
					<div className="border-b border-border/70 px-6 py-4">
						<div className="flex flex-wrap items-start justify-between gap-3">
							<div>
								<h2 className="text-lg font-semibold">Stock Grants</h2>
								<p className="text-sm text-muted-foreground">
									Manage grant schedules for this employee.
								</p>
							</div>
							{canManageGrants ? (
								<Button
									size="sm"
									onClick={() => grantsRef.current?.openCreate()}
									disabled={isGrantActionBlocked}
									title={
										isGrantActionBlocked
											? "User must be active, enabled, and have accepted their invitation to receive grants."
											: undefined
									}
								>
									New grant
								</Button>
							) : null}
						</div>
					</div>
					<div className="flex min-h-0 flex-1 flex-col px-6 py-4">
						{canViewGrants ? (
							<StockGrantsSection
								key={membershipId}
								ref={grantsRef}
								membershipId={membershipId}
								canManage={canManageGrants}
							/>
						) : (
							<p className="text-sm text-muted-foreground">
								You do not have access to view stock grants.
							</p>
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