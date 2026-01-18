import { useMemo } from "react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import type { LoanRepaymentsPanelProps } from "@/entities/loan/components/types";
import type { LoanRepayment } from "@/entities/loan/types";

export function LoanRepaymentsPanel({
	repayments,
	isLoading,
	isError,
	onRetry,
	headerActions,
}: LoanRepaymentsPanelProps) {
	const columns = useMemo<ColumnDefinition<LoanRepayment>[]>(
		() => [
			{
				id: "payment_date",
				header: "Payment date",
				accessorKey: "payment_date",
				cell: ({ row }) => formatDate(row.original.payment_date),
			},
			{
				id: "amount",
				header: "Amount",
				accessorKey: "amount",
				cell: ({ row }) => formatCurrency(row.original.amount),
			},
			{
				id: "principal_amount",
				header: "Principal",
				accessorKey: "principal_amount",
				cell: ({ row }) => formatCurrency(row.original.principal_amount),
			},
			{
				id: "interest_amount",
				header: "Interest",
				accessorKey: "interest_amount",
				cell: ({ row }) => formatCurrency(row.original.interest_amount),
			},
			{
				id: "recorded_by",
				header: "Recorded by",
				accessorKey: "recorded_by_user_id",
				cell: ({ row }) => row.original.recorded_by_user_id ?? "—",
			},
			{
				id: "created_at",
				header: "Created",
				accessorKey: "created_at",
				cell: ({ row }) => formatDate(row.original.created_at),
			},
		],
		[]
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
			className="min-h-[260px]"
		/>
	);
}
