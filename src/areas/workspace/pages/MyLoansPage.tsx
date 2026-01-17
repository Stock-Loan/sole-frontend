import { useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { ToolbarButton } from "@/shared/ui/toolbar";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { routes } from "@/shared/lib/routes";
import { formatDate, formatCurrency } from "@/shared/lib/format";
import { usePermissions } from "@/auth/hooks";
import {
	useCancelMyLoanApplication,
	useMyLoanApplications,
} from "@/entities/loan/hooks";
import { LoanStatusBadge } from "@/entities/loan/components/LoanStatusBadge";
import type { LoanApplicationSummary } from "@/entities/loan/types";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30];
const DEFAULT_PAGE_SIZE = 10;

export function MyLoansPage() {
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const { can } = usePermissions();
	const canViewLoans = can("loan.view_own");
	const canCancelLoans = can(["loan.cancel_own", "loan.apply"]);

	const navigate = useNavigate();
	const [paginationState, setPaginationState] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: DEFAULT_PAGE_SIZE,
	});
	const [selectionResetKey, setSelectionResetKey] = useState(0);
	const [cancelTarget, setCancelTarget] =
		useState<LoanApplicationSummary | null>(null);
	const listParams = useMemo(
		() => ({
			limit: paginationState.pageSize,
			offset: paginationState.pageIndex * paginationState.pageSize,
		}),
		[paginationState.pageIndex, paginationState.pageSize]
	);

	const loansQuery = useMyLoanApplications(listParams, {
		enabled: canViewLoans,
	});

	const cancelMutation = useCancelMyLoanApplication({
		onSuccess: () => {
			toast({ title: "Loan draft cancelled" });
			setCancelTarget(null);
			setSelectionResetKey((prev) => prev + 1);
		},
		onError: (error) =>
			apiErrorToast(error, "Unable to cancel the loan draft."),
	});

	const loans = loansQuery.data?.items ?? [];
	const totalRows = loansQuery.data?.total ?? loans.length;
	const totalPages = Math.max(
		1,
		Math.ceil(totalRows / paginationState.pageSize)
	);

	const columns: ColumnDefinition<LoanApplicationSummary>[] = [
		{
			id: "created_at",
			header: "Created",
			accessor: (loan) => loan.created_at,
			cell: (loan) => formatDate(loan.created_at),
		},
		{
			id: "updated_at",
			header: "Updated",
			accessor: (loan) => loan.updated_at,
			cell: (loan) => formatDate(loan.updated_at),
		},
		{
			id: "status",
			header: "Status",
			accessor: (loan) => loan.status,
			cell: (loan) => <LoanStatusBadge status={loan.status} />,
		},
		{
			id: "shares_to_exercise",
			header: "Shares",
			accessor: (loan) => loan.shares_to_exercise ?? 0,
			cell: (loan) => loan.shares_to_exercise?.toLocaleString() ?? "—",
		},
		{
			id: "loan_principal",
			header: "Loan principal",
			accessor: (loan) => loan.loan_principal ?? "",
			cell: (loan) => formatCurrency(loan.loan_principal),
		},
	];

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="My loans"
				subtitle="Track your active loan applications and repayment status."
			/>

			{!canViewLoans ? (
				<EmptyState
					title="Loan applications unavailable"
					message="You do not have permission to view your loan applications."
				/>
			) : loansQuery.isError ? (
				<EmptyState
					title="Unable to load loan applications"
					message="We couldn't fetch your loan applications right now."
					actionLabel="Retry"
					onRetry={() => loansQuery.refetch()}
				/>
			) : (
				<DataTable
					data={loans}
					columns={columns}
					getRowId={(loan) => loan.id}
					isLoading={loansQuery.isLoading}
					emptyMessage="No loan applications yet."
					enableExport={false}
					enableRowSelection
					className="flex-1 min-h-0"
					selectionResetKey={selectionResetKey}
					renderToolbarActions={(selectedLoans) => {
						const hasSingle = selectedLoans.length === 1;
						const selectedLoan = hasSingle ? selectedLoans[0] : null;
						const isDraft = selectedLoan?.status === "DRAFT";
						const canCancel = Boolean(canCancelLoans && isDraft);
						return (
							<div className="flex items-center gap-2">
								<ToolbarButton
									variant="outline"
									size="sm"
									disabled={!hasSingle}
									onClick={() => {
										if (!selectedLoan) return;
										navigate(
											routes.workspaceLoanDetail.replace(":id", selectedLoan.id)
										);
									}}
								>
									View
								</ToolbarButton>
								<ToolbarButton
									variant="destructive"
									size="sm"
									disabled={!hasSingle || !canCancel}
									onClick={() => {
										if (!selectedLoan || !canCancel) return;
										setCancelTarget(selectedLoan);
									}}
								>
									Cancel draft
								</ToolbarButton>
								<ToolbarButton
									variant="default"
									size="sm"
									disabled={!hasSingle || !isDraft}
									onClick={() => {
										if (!selectedLoan) return;
										navigate(
											routes.workspaceLoanWizardEdit.replace(
												":id",
												selectedLoan.id
											)
										);
									}}
								>
									Edit draft
								</ToolbarButton>
							</div>
						);
					}}
					pagination={{
						enabled: true,
						mode: "server",
						state: paginationState,
						onPaginationChange: setPaginationState,
						pageCount: totalPages,
						totalRows,
						pageSizeOptions: PAGE_SIZE_OPTIONS,
					}}
				/>
			)}

			<Dialog
				open={Boolean(cancelTarget)}
				onOpenChange={(open) => {
					if (!open) setCancelTarget(null);
				}}
			>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>Cancel draft application?</DialogTitle>
						<DialogDescription>
							This will cancel your draft loan application and remove it
							from your list.
						</DialogDescription>
					</DialogHeader>
					<DialogBody>
						<p className="text-sm text-muted-foreground">
							You can start a new application at any time.
						</p>
					</DialogBody>
					<DialogFooter>
						<Button variant="outline" onClick={() => setCancelTarget(null)}>
							Keep draft
						</Button>
						<Button
							variant="destructive"
							disabled={cancelMutation.isPending || !cancelTarget}
							onClick={() => {
								if (!cancelTarget) return;
								cancelMutation.mutate(cancelTarget.id);
							}}
						>
							{cancelMutation.isPending ? "Cancelling..." : "Cancel draft"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
