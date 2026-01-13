import { useMemo, useState } from "react";
import type { PaginationState, VisibilityState } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type {
	ColumnDefinition,
	DataTablePreferencesConfig,
} from "@/shared/ui/Table/types";
import { loadDataTablePreferences } from "@/shared/ui/Table/constants";
import { ToolbarButton } from "@/shared/ui/toolbar";
import { routes } from "@/shared/lib/routes";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import { normalizeDisplay } from "@/shared/lib/utils";
import { useAuth, usePermissions } from "@/auth/hooks";
import { useOrgLoanApplications } from "@/entities/loan/hooks";
import { LoanStatusBadge } from "@/entities/loan/components/LoanStatusBadge";
import type { LoanApplicationSummary } from "@/entities/loan/types";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 30, 50];
const DEFAULT_PAGE_SIZE = 20;

export function LoanApplicationsPage() {
	const { user } = useAuth();
	const { can } = usePermissions();
	const canViewLoans = can("loan.view_all") || can("loan.manage");

	const navigate = useNavigate();
	const preferencesConfig = useMemo<DataTablePreferencesConfig>(
		() => ({
			id: "org-loans-list",
			scope: "user",
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
		}),
		[user?.id, user?.org_id]
	);
	const persistedPreferences = useMemo(
		() => loadDataTablePreferences(preferencesConfig),
		[preferencesConfig]
	);
	const preferredPageSize =
		typeof persistedPreferences?.pagination?.pageSize === "number"
			? persistedPreferences.pagination.pageSize
			: DEFAULT_PAGE_SIZE;

	const [paginationState, setPaginationState] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: preferredPageSize,
	});
	const listParams = useMemo(
		() => ({
			limit: paginationState.pageSize,
			offset: paginationState.pageIndex * paginationState.pageSize,
		}),
		[paginationState.pageIndex, paginationState.pageSize]
	);

	const loansQuery = useOrgLoanApplications(listParams, {
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
			id: "applicantName",
			header: "Applicant",
			accessor: (loan) => loan.applicant?.full_name ?? "",
			filterAccessor: (loan) =>
				`${loan.applicant?.full_name ?? ""} ${loan.applicant?.email ?? ""}`.trim(),
			cell: (loan) => loan.applicant?.full_name ?? "—",
			headerClassName: "min-w-[180px]",
		},
		{
			id: "applicantEmail",
			header: "Applicant email",
			accessor: (loan) => loan.applicant?.email ?? "",
			cell: (loan) => loan.applicant?.email ?? "—",
		},
		{
			id: "employeeId",
			header: "Employee ID",
			accessor: (loan) => loan.applicant?.employee_id ?? "",
			cell: (loan) => loan.applicant?.employee_id ?? "—",
		},
		{
			id: "departmentName",
			header: "Department",
			accessor: (loan) => loan.applicant?.department_name ?? "",
			cell: (loan) => loan.applicant?.department_name ?? "—",
		},
		{
			id: "departmentId",
			header: "Department ID",
			accessor: (loan) => loan.applicant?.department_id ?? "",
			cell: (loan) => loan.applicant?.department_id ?? "—",
		},
		{
			id: "userId",
			header: "User ID",
			accessor: (loan) => loan.applicant?.user_id ?? "",
			cell: (loan) => loan.applicant?.user_id ?? "—",
		},
		{
			id: "orgMembershipId",
			header: "Org membership ID",
			accessor: (loan) => loan.org_membership_id ?? "",
			cell: (loan) => loan.org_membership_id ?? "—",
		},
		{
			id: "loanId",
			header: "Loan ID",
			accessor: (loan) => loan.id,
			cell: (loan) => loan.id,
		},
		{
			id: "status",
			header: "Status",
			accessor: (loan) => loan.status,
			cell: (loan) => <LoanStatusBadge status={loan.status} />,
		},
		{
			id: "currentStageType",
			header: "Stage type",
			accessor: (loan) => loan.current_stage_type ?? "",
			cell: (loan) => normalizeDisplay(loan.current_stage_type ?? "—"),
		},
		{
			id: "currentStageStatus",
			header: "Stage status",
			accessor: (loan) => loan.current_stage_status ?? "",
			cell: (loan) => normalizeDisplay(loan.current_stage_status ?? "—"),
		},
		{
			id: "as_of_date",
			header: "As of date",
			accessor: (loan) => loan.as_of_date ?? "",
			cell: (loan) => formatDate(loan.as_of_date),
		},
		{
			id: "version",
			header: "Version",
			accessor: (loan) => loan.version,
			cell: (loan) => String(loan.version),
		},
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
			id: "total_exercisable_shares_snapshot",
			header: "Total exercisable",
			accessor: (loan) => loan.total_exercisable_shares_snapshot ?? 0,
			cell: (loan) =>
				formatShares(loan.total_exercisable_shares_snapshot),
		},
		{
			id: "shares_to_exercise",
			header: "Shares",
			accessor: (loan) => loan.shares_to_exercise ?? 0,
			cell: (loan) => formatShares(loan.shares_to_exercise),
		},
		{
			id: "purchase_price",
			header: "Purchase price",
			accessor: (loan) => loan.purchase_price ?? "",
			cell: (loan) => formatCurrency(loan.purchase_price),
		},
		{
			id: "down_payment_amount",
			header: "Down payment",
			accessor: (loan) => loan.down_payment_amount ?? "",
			cell: (loan) => formatCurrency(loan.down_payment_amount),
		},
		{
			id: "loan_principal",
			header: "Loan principal",
			accessor: (loan) => loan.loan_principal ?? "",
			cell: (loan) => formatCurrency(loan.loan_principal),
		},
		{
			id: "estimated_monthly_payment",
			header: "Est. monthly payment",
			accessor: (loan) => loan.estimated_monthly_payment ?? "",
			cell: (loan) => formatCurrency(loan.estimated_monthly_payment),
		},
		{
			id: "total_payable_amount",
			header: "Total payable",
			accessor: (loan) => loan.total_payable_amount ?? "",
			cell: (loan) => formatCurrency(loan.total_payable_amount),
		},
		{
			id: "interest_type",
			header: "Interest type",
			accessor: (loan) => loan.interest_type ?? "",
			cell: (loan) => normalizeDisplay(loan.interest_type ?? "—"),
		},
		{
			id: "repayment_method",
			header: "Repayment method",
			accessor: (loan) => loan.repayment_method ?? "",
			cell: (loan) => normalizeDisplay(loan.repayment_method ?? "—"),
		},
		{
			id: "term_months",
			header: "Term (months)",
			accessor: (loan) => loan.term_months ?? 0,
			cell: (loan) => (loan.term_months ? `${loan.term_months}` : "—"),
		},
	];

	const initialColumnVisibility = useMemo<VisibilityState>(
		() => ({
			applicantEmail: false,
			employeeId: false,
			departmentId: false,
			userId: false,
			orgMembershipId: false,
			loanId: false,
			as_of_date: false,
			version: false,
			total_exercisable_shares_snapshot: false,
			purchase_price: false,
			down_payment_amount: false,
			estimated_monthly_payment: false,
			total_payable_amount: false,
			interest_type: false,
			repayment_method: false,
		}),
		[]
	);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Loan applications"
				subtitle="Track new and in-flight loan applications."
			/>

			{!canViewLoans ? (
				<EmptyState
					title="Loan applications unavailable"
					message="You do not have permission to view loan applications."
				/>
			) : loansQuery.isError ? (
				<EmptyState
					title="Unable to load loan applications"
					message="We couldn't fetch loan applications right now."
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
					preferences={preferencesConfig}
					initialColumnVisibility={initialColumnVisibility}
					className="flex-1 min-h-0"
					renderToolbarActions={(selectedLoans) => {
						const hasSingle = selectedLoans.length === 1;
						const selectedLoan = hasSingle ? selectedLoans[0] : null;
						return (
							<div className="flex items-center gap-2">
								<ToolbarButton
									variant="outline"
									size="sm"
									disabled={!hasSingle}
									onClick={() => {
										if (!selectedLoan) return;
										navigate(
											routes.loansDetail.replace(
												":loanId",
												selectedLoan.id
											)
										);
									}}
								>
									View
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
