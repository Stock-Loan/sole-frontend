import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function MyStockPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="My stock"
				subtitle="Review personal grant, vesting, and eligibility details."
			/>
			<EmptyState
				title="Stock summaries coming soon"
				message="You'll see your grant and vesting details here once enabled."
			/>
		</PageContainer>
	);
}
