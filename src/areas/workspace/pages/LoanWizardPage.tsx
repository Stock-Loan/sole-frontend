import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function LoanWizardPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Loan application"
				subtitle="Build and submit your stock exercise loan request."
			/>
			<EmptyState
				title="Loan wizard coming soon"
				message="This flow will guide you through exercise options and loan terms."
			/>
		</PageContainer>
	);
}
