import { useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function LoanDetailPage() {
	const { loanId } = useParams();

	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Loan detail"
				subtitle={loanId ? `Loan ID: ${loanId}` : "Review loan details and schedules."}
			/>
			<EmptyState
				title="Loan detail coming soon"
				message="This view will include schedules, payments, and documents."
			/>
		</PageContainer>
	);
}
