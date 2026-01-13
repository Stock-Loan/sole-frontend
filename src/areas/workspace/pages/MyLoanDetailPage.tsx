import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import { routes } from "@/shared/lib/routes";
import { usePermissions } from "@/auth/hooks";
import { useMyLoanApplication } from "@/entities/loan/hooks";
import { LoanSelfDetailContent } from "@/entities/loan/components/LoanSelfDetailContent";

export function MyLoanDetailPage() {
	const { id } = useParams();
	const { can } = usePermissions();
	const canViewLoans = can("loan.view_own");
	const canApplyLoan = can("loan.apply");

	const loanQuery = useMyLoanApplication(id ?? "", { enabled: canViewLoans });
	const loan = loanQuery.data;

	if (!canViewLoans) {
		return (
			<PageContainer className="space-y-4">
				<PageHeader
					title="Loan application"
					subtitle="Review your loan application details."
				/>
				<EmptyState
					title="Loan application unavailable"
					message="You do not have permission to view loan applications."
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan application"
				subtitle="Review your loan application details."
				actions={
					<div className="flex items-center gap-2">
						<Button asChild variant="outline" size="sm">
							<Link to={routes.workspaceLoans}>Back to Loans</Link>
						</Button>
						{loan?.status === "DRAFT" && canApplyLoan ? (
							<Button asChild size="sm">
								<Link
									to={routes.workspaceLoanWizardEdit.replace(":id", loan.id)}
								>
									Edit draft
								</Link>
							</Button>
						) : null}
					</div>
				}
			/>

			<LoanSelfDetailContent
				loan={loan}
				isLoading={loanQuery.isLoading}
				isError={loanQuery.isError}
				onRetry={() => loanQuery.refetch()}
			/>
		</PageContainer>
	);
}
