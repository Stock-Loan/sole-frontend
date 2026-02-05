import { useMemo } from "react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { sanitizeExternalUrl } from "@/shared/lib/urls";
import { cn } from "@/shared/lib/utils";
import type { LoanRepaymentsPanelProps } from "@/entities/loan/types";
import type { LoanRepayment } from "@/entities/loan/types";

export function LoanRepaymentsPanel({
	repayments,
	isLoading,
	isError,
	onRetry,
	headerActions,
	className,
}: LoanRepaymentsPanelProps) {
	const columns = useMemo<ColumnDefinition<LoanRepayment>[]>(
		() => [
			{
				id: "payment_date",
				header: "Payment date",
				accessor: "payment_date",
				cell: (row) => formatDate(row.payment_date),
			},
			{
				id: "amount",
				header: "Amount",
				accessor: "amount",
				cell: (row) => formatCurrency(row.amount),
			},
			{
				id: "principal_amount",
				header: "Principal",
				accessor: "principal_amount",
				cell: (row) => formatCurrency(row.principal_amount),
			},
			{
				id: "interest_amount",
				header: "Interest",
				accessor: "interest_amount",
				cell: (row) => formatCurrency(row.interest_amount),
			},
			{
				id: "recorded_by",
				header: "Recorded by",
				accessor: "recorded_by_name",
				cell: (row) => row.recorded_by_name ?? row.recorded_by_user_id ?? "—",
			},
			{
				id: "evidence",
				header: "Evidence",
				accessor: "evidence_file_name",
				cell: (row) => {
					const name = row.evidence_file_name;
					const url = sanitizeExternalUrl(
						row.evidence_storage_path_or_url,
					);
					if (!name) return "—";
					if (!url) return name;
					return (
						<a
							href={url}
							target="_blank"
							rel="noreferrer"
							className="text-primary underline"
						>
							{name}
						</a>
					);
				},
			},
			{
				id: "created_at",
				header: "Created",
				accessor: "created_at",
				cell: (row) => formatDate(row.created_at),
			},
		],
		[],
	);

	if (isError) {
		return (
			<EmptyState
				title="Unable to load repayments"
				message="We couldn't fetch repayments for this loan."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	return (
		<DataTable
			data={repayments ?? []}
			columns={columns}
			getRowId={(row) => row.id}
			isLoading={isLoading}
			emptyMessage="No repayments yet. Activity will appear once payments are recorded."
			headerActions={headerActions}
			className={cn("min-h-0 flex-1", className)}
		/>
	);
}
