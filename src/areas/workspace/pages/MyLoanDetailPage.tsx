import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { routes } from "@/shared/lib/routes";
import { usePermissions } from "@/auth/hooks";
import {
	useMyLoanApplication,
	useMyLoanDocuments,
} from "@/entities/loan/hooks";
import { LoanSelfDetailContent } from "@/entities/loan/components/loan-pages/LoanSelfDetailContent";

export function MyLoanDetailPage() {
	const { id } = useParams();
	const { can } = usePermissions();
	const canViewLoans = can("loan.view_own");
	const canApplyLoan = can("loan.apply");
	const canViewDocuments = can("loan.document.self_view");
	const canViewRepayments = can("loan.payment.self.view");
	const canViewSchedule = can("loan.schedule.self.view");
	const canExportLoan = can("loan.export.self");
	const canUpload83b = can("loan.document.self_upload_83b");
	const canRunWhatIf = can("loan.what_if.self.simulate");

	const loanQuery = useMyLoanApplication(id ?? "", { enabled: canViewLoans });
	const loan = loanQuery.data;
	const documentsQuery = useMyLoanDocuments(id ?? "", {
		enabled: canViewDocuments && loan?.status === "ACTIVE",
	});

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

	if (loanQuery.isLoading) {
		return <MyLoanDetailPageSkeleton />;
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
				documentGroups={documentsQuery.data?.groups}
				documentsLoading={documentsQuery.isLoading}
				documentsError={documentsQuery.isError}
				onDocumentsRetry={() => documentsQuery.refetch()}
				permissions={{
					canViewDocuments,
					canViewRepayments,
					canViewSchedule,
					canExportLoan,
					canUpload83b,
					canRunWhatIf,
				}}
			/>
		</PageContainer>
	);
}

function MyLoanDetailPageSkeleton() {
	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan application"
				subtitle="Review your loan application details."
				actions={
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-28" />
						<Skeleton className="h-9 w-24" />
					</div>
				}
			/>

			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={`my-loan-page-summary-skeleton-${index}`}
							className="rounded-lg border bg-card p-6 shadow-sm"
						>
							<Skeleton className="h-3 w-24" />
							<Skeleton className="mt-3 h-7 w-28" />
						</div>
					))}
				</div>

				<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
					<Skeleton className="h-9 w-24 rounded-md" />
					<Skeleton className="h-9 w-24 rounded-md" />
					<Skeleton className="h-9 w-24 rounded-md" />
				</div>

				<div className="grid gap-4 lg:grid-cols-2">
					{Array.from({ length: 2 }).map((_, cardIndex) => (
						<div
							key={`my-loan-page-overview-skeleton-${cardIndex}`}
							className="rounded-lg border bg-card p-6 shadow-sm"
						>
							<Skeleton className="h-4 w-40" />
							<div className="mt-4 space-y-3">
								{Array.from({ length: 6 }).map((__, rowIndex) => (
									<div
										key={`my-loan-page-overview-row-${cardIndex}-${rowIndex}`}
										className="flex items-center justify-between"
									>
										<Skeleton className="h-3 w-32" />
										<Skeleton className="h-3 w-24" />
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				<div className="rounded-lg border bg-card p-6 shadow-sm">
					<Skeleton className="h-4 w-36" />
					<div className="mt-4 space-y-2">
						{Array.from({ length: 5 }).map((_, index) => (
							<Skeleton
								key={`my-loan-page-table-row-skeleton-${index}`}
								className="h-10 w-full"
							/>
						))}
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
