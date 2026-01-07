import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function LoanApplicationsPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Loan applications"
				subtitle="Track new and in-flight loan applications."
			/>
			<EmptyState
				title="Loan applications coming soon"
				message="This area will list applications and their current approval status."
			/>
		</PageContainer>
	);
}
