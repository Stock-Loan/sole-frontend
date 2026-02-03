import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { routes } from "@/shared/lib/routes";
import { StockGrantDetail } from "@/entities/stock-grant/components/StockGrantDetail";
import {
	useOrgStockGrant,
	useUpdateStockGrant,
} from "@/entities/stock-grant/hooks";
import { StockGrantDialog } from "@/entities/stock-grant/components/StockGrantDialog";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { useToast } from "@/shared/ui/use-toast";
import { usePermissions } from "@/auth/hooks";
import type {
	StockGrant,
	StockGrantFormValues,
	StockGrantUpdateInput,
} from "@/entities/stock-grant/types";

export function GrantDetailPage() {
	const { grantId } = useParams<{ grantId: string }>();
	const resolvedId = grantId ?? "";
	const { can } = usePermissions();
	const canManage = can("stock.manage");
	const grantQuery = useOrgStockGrant(resolvedId, {
		enabled: Boolean(resolvedId),
	});
	const [dialogOpen, setDialogOpen] = useState(false);
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();

	const membershipId = grantQuery.data?.org_membership_id ?? "";
	const updateMutation = useUpdateStockGrant(membershipId, {
		onSuccess: () => {
			toast({ title: "Stock grant updated" });
			setDialogOpen(false);
			grantQuery.refetch();
		},
		onError: (error) => apiErrorToast(error, "Unable to update stock grant."),
	});

	const buildPayload = useMemo(
		() => (values: StockGrantFormValues): StockGrantUpdateInput => {
			const vestingEvents =
				values.vesting_strategy === "SCHEDULED"
					? values.vesting_events.map((event) => ({
							vest_date: event.vest_date,
							shares: event.shares,
						}))
					: undefined;

			return {
				status: values.status,
				notes: values.notes?.trim() || null,
				vesting_events: vestingEvents,
			};
		},
		[],
	);

	const handleSubmit = async (values: StockGrantFormValues) => {
		const grant = grantQuery.data;
		if (!grant) return;
		await updateMutation.mutateAsync({
			grantId: grant.id,
			payload: buildPayload(values),
		});
	};

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Grant details"
				subtitle="Review the full grant record and vesting events."
				actions={
					<div className="flex items-center gap-2">
						{canManage ? (
							<Button
								size="sm"
								onClick={() => setDialogOpen(true)}
								disabled={!grantQuery.data}
							>
								Edit grant
							</Button>
						) : null}
						<Button asChild variant="outline" size="sm">
							<Link to={routes.stockGrants}>Back to grants</Link>
						</Button>
					</div>
				}
			/>
			<StockGrantDetail
				grant={grantQuery.data ?? null}
				isLoading={grantQuery.isLoading}
				isError={grantQuery.isError}
				onRetry={() => grantQuery.refetch()}
				showOrgFields
			/>
			<StockGrantDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				mode="edit"
				initialGrant={grantQuery.data as StockGrant | null}
				onSubmit={handleSubmit}
				isSubmitting={updateMutation.isPending}
			/>
		</PageContainer>
	);
}
