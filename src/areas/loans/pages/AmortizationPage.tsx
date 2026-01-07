import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function AmortizationPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Amortization"
				subtitle="Explore amortization schedules and projections."
			/>
			<EmptyState
				title="Amortization tools coming soon"
				message="Charts and schedules will be available once data is connected."
			/>
		</PageContainer>
	);
}
