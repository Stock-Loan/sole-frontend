import { Link } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { routes } from "@/shared/lib/routes";
import { formatDate } from "@/shared/lib/format";
import { usePermissions } from "@/auth/hooks/hooks";
import { useMyLoanApplications } from "@/entities/loan/hooks";
import { LoanStatusBadge } from "@/entities/loan/components/loan-pages/LoanStatusBadge";

export function MyDocumentsPage() {
	const { can } = usePermissions();
	const canViewDocuments =
		can("loan.document.self_view") || can("loan.view_own");

	const loansQuery = useMyLoanApplications(
		{ limit: 50, offset: 0 },
		{ enabled: canViewDocuments },
	);
	const loans = loansQuery.data?.items ?? [];

	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="My documents"
				subtitle="Review your loan documents and upload required forms."
			/>
			{!canViewDocuments ? (
				<EmptyState
					title="Documents unavailable"
					message="You do not have permission to view loan documents."
				/>
			) : loansQuery.isLoading ? (
				<LoadingState label="Loading your loan documents..." />
			) : loansQuery.isError ? (
				<EmptyState
					title="Unable to load documents"
					message="We couldn't fetch your loan documents right now."
					actionLabel="Retry"
					onRetry={() => loansQuery.refetch()}
				/>
			) : loans.length === 0 ? (
				<EmptyState
					title="No loan documents yet"
					message="Documents will appear once you submit a loan application and admins upload your signed documents."
				/>
			) : (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{loans.map((loan) => (
						<Card key={loan.id} className="border border-border/60">
							<CardHeader className="pb-2">
								<CardTitle className="flex items-center justify-between text-sm font-semibold">
									<span>Loan application</span>
									<LoanStatusBadge status={loan.status} />
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-3 text-sm text-muted-foreground">
								<div className="flex items-center justify-between">
									<span>Created</span>
									<span className="font-medium text-foreground">
										{formatDate(loan.created_at)}
									</span>
								</div>
								<div className="flex justify-end">
									<Button asChild variant="outline" size="sm">
										<Link
											to={routes.workspaceLoanDocuments.replace(":id", loan.id)}
										>
											View documents
										</Link>
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</PageContainer>
	);
}
