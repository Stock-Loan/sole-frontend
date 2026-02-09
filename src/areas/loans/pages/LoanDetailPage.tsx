import { Link, useParams } from "react-router-dom";
import { useState } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { Skeleton } from "@/shared/ui/Skeleton";
import { routes } from "@/shared/lib/routes";
import {
	useEditOrgLoanApplication,
	useOrgLoanApplication,
} from "@/entities/loan/hooks";
import { LoanDetailContent } from "@/entities/loan/components/loan-pages/LoanDetailContent";
import { LoanEditDialog } from "@/entities/loan/components/loan-pages/LoanEditDialog";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import { usePermissions } from "@/auth/hooks";
import { buildLoanAdminEditPayload } from "@/entities/loan/utils/edit";
import type { LoanAdminEditFormValues } from "@/entities/loan/types";

export function LoanDetailPage() {
	const { loanId } = useParams();
	const { toast } = useToast();
	const { can } = usePermissions();
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const loanQuery = useOrgLoanApplication(loanId ?? "", {
		enabled: Boolean(loanId),
	});
	const loan = loanQuery.data;
	const canEditLoan = can("loan.manage");
	const loanPermissions = {
		canViewDocuments: can([
			"loan.document.view",
			"loan.document.manage_hr",
			"loan.document.manage_finance",
			"loan.document.manage_legal",
			"loan.workflow.post_issuance.manage",
		]),
		canViewRepayments: can("loan.payment.view"),
		canRecordRepayment: can("loan.payment.record"),
		canViewSchedule: can("loan.schedule.view"),
		canExportSchedule: can("loan.export.schedule"),
		canRunWhatIf: can("loan.what_if.simulate"),
	};
	const editMutation = useEditOrgLoanApplication({
		onSuccess: () => {
			toast({ title: "Loan updated" });
			setEditDialogOpen(false);
		},
		onError: (error) => {
			toast({
				title: "Unable to update loan",
				description: parseApiError(error).message,
				variant: "destructive",
			});
		},
	});
	const editableStatuses = ["DRAFT", "SUBMITTED", "IN_REVIEW"];
	const isEditable =
		Boolean(loan) && editableStatuses.includes(loan?.status ?? "");
	const handleEditSubmit = async (values: LoanAdminEditFormValues) => {
		if (!loanId) return;
		const payload = buildLoanAdminEditPayload(values, loan);
		await editMutation.mutateAsync({ id: loanId, payload });
	};

	if (loanQuery.isLoading) {
		return <LoanDetailPageSkeleton />;
	}

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan application"
				subtitle={
					loanId ? `Loan ID: ${loanId}` : "Review loan details and schedules."
				}
				actions={
					<div className="flex items-center gap-2">
						{canEditLoan ? (
							<Button
								variant="outline"
								size="sm"
								onClick={() => setEditDialogOpen(true)}
								disabled={!isEditable}
							>
								Edit loan
							</Button>
						) : null}
						<Button asChild variant="outline" size="sm">
							<Link to={routes.loans}>Back to Loans</Link>
						</Button>
					</div>
				}
			/>
			<LoanDetailContent
				loan={loan}
				isLoading={loanQuery.isLoading}
				isError={loanQuery.isError}
				onRetry={() => loanQuery.refetch()}
				permissions={loanPermissions}
			/>
			<LoanEditDialog
				open={editDialogOpen}
				onOpenChange={setEditDialogOpen}
				loan={loan}
				onSubmit={handleEditSubmit}
				isSubmitting={editMutation.isPending}
			/>
		</PageContainer>
	);
}

function LoanDetailPageSkeleton() {
	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan application"
				subtitle="Review loan details and schedules."
				actions={
					<div className="flex items-center gap-2">
						<Skeleton className="h-9 w-24" />
						<Skeleton className="h-9 w-28" />
					</div>
				}
			/>

			<div className="space-y-6">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{Array.from({ length: 4 }).map((_, index) => (
						<div
							key={`loan-page-summary-skeleton-${index}`}
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
							key={`loan-page-overview-skeleton-${cardIndex}`}
							className="rounded-lg border bg-card p-6 shadow-sm"
						>
							<Skeleton className="h-4 w-40" />
							<div className="mt-4 space-y-3">
								{Array.from({ length: 7 }).map((__, rowIndex) => (
									<div
										key={`loan-page-overview-row-${cardIndex}-${rowIndex}`}
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
								key={`loan-page-table-row-skeleton-${index}`}
								className="h-10 w-full"
							/>
						))}
					</div>
				</div>
			</div>
		</PageContainer>
	);
}
