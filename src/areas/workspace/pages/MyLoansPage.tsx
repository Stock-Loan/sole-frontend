import { useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Badge } from "@/shared/ui/badge";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { ToolbarButton } from "@/shared/ui/toolbar";
import { routes } from "@/shared/lib/routes";
import { formatDate, formatCurrency } from "@/shared/lib/format";
import { usePermissions } from "@/auth/hooks";
import { useMyLoanApplications } from "@/entities/loan/hooks";
import type { LoanApplicationSummary } from "@/entities/loan/types";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30];
const DEFAULT_PAGE_SIZE = 10;

export function MyLoansPage() {
	const { can } = usePermissions();
	const canViewLoans = can("loan.view_own");

	const navigate = useNavigate();
	const [paginationState, setPaginationState] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: DEFAULT_PAGE_SIZE,
	});
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
					renderToolbarActions={(selectedLoans) => {
						const hasSingle = selectedLoans.length === 1;
						const selectedLoan = hasSingle ? selectedLoans[0] : null;
						const isDraft = selectedLoan?.status === "DRAFT";
						return (
							<div className="flex items-center gap-2">
								<ToolbarButton
									variant="outline"
									size="sm"
									disabled={!hasSingle}
									onClick={() => {
										if (!selectedLoan) return;
										navigate(
											routes.workspaceLoanDetail.replace(
												":id",
												selectedLoan.id
											)
										);
									}}
								>
									View
								</ToolbarButton>
								<ToolbarButton
									variant="secondary"
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
		</PageContainer>
	);
}

function LoanStatusBadge({ status }: { status: LoanApplicationSummary["status"] }) {
	const variant =
		status === "SUBMITTED"
			? "border-blue-200 bg-blue-50 text-blue-700"
			: status === "IN_REVIEW"
				? "border-amber-200 bg-amber-50 text-amber-700"
				: status === "ACTIVE"
					? "border-emerald-200 bg-emerald-50 text-emerald-700"
					: status === "REJECTED"
						? "border-red-200 bg-red-50 text-red-700"
						: status === "CANCELLED"
							? "border-slate-200 bg-slate-50 text-slate-600"
							: "border-border bg-muted text-muted-foreground";

	return (
		<Badge variant="secondary" className={variant}>
			{status}
		</Badge>
	);
}
