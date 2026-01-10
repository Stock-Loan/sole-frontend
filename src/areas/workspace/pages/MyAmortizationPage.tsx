import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function MyAmortizationPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="My amortization"
				subtitle="Review your loan amortization schedule and repayment timeline."
			/>
			<EmptyState
				title="Amortization schedule coming soon"
				message="This workspace will show your personal loan schedules and payment breakdowns."
			/>
		</PageContainer>
	);
}
