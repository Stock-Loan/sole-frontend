import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { routes } from "@/shared/lib/routes";
import { useOrgLoanApplication } from "@/entities/loan/hooks";
import { LoanDetailContent } from "@/entities/loan/components/loan-pages/LoanDetailContent";

export function LoanDetailPage() {
	const { loanId } = useParams();
	const loanQuery = useOrgLoanApplication(loanId ?? "", {
		enabled: Boolean(loanId),
	});
	const loan = loanQuery.data;

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan application"
				subtitle={
					loanId ? `Loan ID: ${loanId}` : "Review loan details and schedules."
				}
				actions={
					<Button asChild variant="outline" size="sm">
						<Link to={routes.loans}>Back to Loans</Link>
					</Button>
				}
			/>
			<LoanDetailContent
				loan={loan}
				isLoading={loanQuery.isLoading}
				isError={loanQuery.isError}
				onRetry={() => loanQuery.refetch()}
			/>
		</PageContainer>
	);
}
