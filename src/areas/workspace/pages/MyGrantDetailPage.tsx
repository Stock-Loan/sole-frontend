import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { routes } from "@/shared/lib/routes";
import { StockGrantDetail } from "@/entities/stock-grant/components/StockGrantDetail";
import { useMyStockGrant } from "@/entities/stock-grant/hooks";

export function MyGrantDetailPage() {
	const { grantId } = useParams<{ grantId: string }>();
	const resolvedId = grantId ?? "";
	const grantQuery = useMyStockGrant(resolvedId, {
		enabled: Boolean(resolvedId),
	});

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Grant details"
				subtitle="Review your grant record and vesting events."
				actions={
					<Button asChild variant="outline" size="sm">
						<Link to={routes.workspaceGrants}>Back to my grants</Link>
					</Button>
				}
			/>
			<StockGrantDetail
				grant={grantQuery.data ?? null}
				isLoading={grantQuery.isLoading}
				isError={grantQuery.isError}
				onRetry={() => grantQuery.refetch()}
			/>
		</PageContainer>
	);
}
