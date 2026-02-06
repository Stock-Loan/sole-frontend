import { useRef } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useAuth, usePermissions } from "@/auth/hooks";
import { StockGrantsSection } from "@/entities/stock-grant/components/StockGrantsSection";
import type { StockGrantsSectionHandle } from "@/entities/stock-grant/types";
import { useStockSearch } from "@/entities/stock-grant/context/context";
import { StockUserSearch } from "@/entities/stock-grant/components/StockUserSearch";

export function GrantsPage() {
	const { can } = usePermissions();
	const { user } = useAuth();
	const { selectedUser } = useStockSearch();
	const grantsRef = useRef<StockGrantsSectionHandle>(null);

	const canViewGrants = can("stock.view") || can("stock.manage");
	const canManageGrants = can("stock.manage");
	const canViewSummary = can(["stock.vesting.view", "stock.eligibility.view"]);

	const membershipId = selectedUser?.membership.id ?? "";

	const employmentStatus =
		selectedUser?.membership.employment_status?.toString().toUpperCase() ?? "";
	const platformStatus =
		selectedUser?.membership.platform_status?.toString().toUpperCase() ?? "";
	const isGrantActionBlocked = !(
		employmentStatus === "ACTIVE" && platformStatus === "ACTIVE"
	);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Grants"
				subtitle="Manage equity grants across the organization."
				actions={<StockUserSearch />}
			/>

			{selectedUser ? (
				<div className="flex min-h-0 flex-1 flex-col">
					{canViewGrants ? (
						<StockGrantsSection
							key={membershipId}
							ref={grantsRef}
							membershipId={membershipId}
							canManage={canManageGrants}
							isGrantActionBlocked={isGrantActionBlocked}
							canViewSummary={canViewSummary}
							userId={user?.id ?? null}
							orgId={user?.org_id ?? null}
						/>
					) : (
						<p className="text-sm text-muted-foreground">
							You do not have access to view stock grants.
						</p>
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
