import { useRef } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { usePermissions } from "@/auth/hooks";
import { StockGrantsSection } from "@/entities/stock-grant/components/StockGrantsSection";
import { useStockSummary } from "@/entities/stock-grant/hooks";
import type { StockGrantsSectionHandle } from "@/entities/stock-grant/types";
import { useStockSearch } from "@/entities/stock-grant/context/context";
import { StockUserSearch } from "@/entities/stock-grant/components/StockUserSearch";

export function GrantsPage() {
	const { can } = usePermissions();
	const { selectedUser } = useStockSearch();
	const grantsRef = useRef<StockGrantsSectionHandle>(null);

	const canViewGrants = can("stock.view") || can("stock.manage");
	const canManageGrants = can("stock.manage");
	const canViewEligibility = can([
		"stock.vesting.view",
		"stock.eligibility.view",
	]);

	const membershipId = selectedUser?.membership.id ?? "";

	const {
		data: summaryData,
		isLoading,
		isFetching,
	} = useStockSummary(
		membershipId,
		{},
		{
			enabled: Boolean(membershipId) && canViewEligibility,
		}
	);

	const grantEligibility =
		summaryData?.eligibility_result?.eligible_to_exercise;
	const isGrantActionBlocked =
		grantEligibility === false ||
		(canViewEligibility && (isLoading || isFetching));

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
						<div className="space-y-1">
							<h2 className="text-md font-semibold">Stock Grants</h2>
							<p className="text-sm text-muted-foreground">
								Manage grant schedules for this employee.
							</p>
						</div>
					</div>
					<div className="flex min-h-0 flex-1 flex-col px-6 py-4">
						{canViewGrants ? (
							<StockGrantsSection
								key={membershipId}
								ref={grantsRef}
								membershipId={membershipId}
								canManage={canManageGrants}
								isGrantActionBlocked={isGrantActionBlocked}
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
