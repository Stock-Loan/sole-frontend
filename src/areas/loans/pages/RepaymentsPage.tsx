import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function RepaymentsPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Repayments"
				subtitle="Manage repayment schedules and payment history."
			/>
			<EmptyState
				title="Repayments coming soon"
				message="Payment history and repayment actions will appear here."
			/>
		</PageContainer>
	);
}
