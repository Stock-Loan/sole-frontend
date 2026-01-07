import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function MyLoansPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="My loans"
				subtitle="Track your active loan applications and repayment status."
			/>
			<EmptyState
				title="Loan self-service coming soon"
				message="This workspace will show your loan applications and status updates."
			/>
		</PageContainer>
	);
}
