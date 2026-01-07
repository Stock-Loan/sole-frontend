import { useMemo } from "react";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import type {
	BulkOnboardingErrorItem,
	BulkOnboardingResultsTableProps,
	BulkOnboardingSuccessItem,
} from "../types";

export function BulkOnboardingResultsTable({
	successes,
	errors,
}: BulkOnboardingResultsTableProps) {
	const successColumns = useMemo<
		ColumnDefinition<BulkOnboardingSuccessItem>[]
	>(
		() => [
			{
				id: "row",
				header: "Row",
				accessor: (row) => row.row_number,
				cell: (row) => row.row_number,
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
				headerClassName: "w-16",
				cellClassName: "font-medium",
			},
			{
				id: "email",
				header: "Email",
				accessor: (row) => row.user?.email ?? row.email ?? "—",
				cell: (row) => row.user?.email ?? row.email ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "firstName",
				header: "First name",
				accessor: (row) => row.user?.first_name ?? row.first_name ?? "—",
				cell: (row) => row.user?.first_name ?? row.first_name ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "lastName",
				header: "Last name",
				accessor: (row) => row.user?.last_name ?? row.last_name ?? "—",
				cell: (row) => row.user?.last_name ?? row.last_name ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "employeeId",
				header: "Employee ID",
				accessor: (row) =>
					row.membership?.employee_id ?? row.employee_id ?? "—",
				cell: (row) => row.membership?.employee_id ?? row.employee_id ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "employmentStatus",
				header: "Employment status",
				accessor: (row) => row.membership?.employment_status ?? "—",
				cell: (row) => row.membership?.employment_status ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "platformStatus",
				header: "Platform status",
				accessor: (row) => row.membership?.platform_status ?? "—",
				cell: (row) => row.membership?.platform_status ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "department",
				header: "Department",
				accessor: (row) => row.membership?.department_name ?? "—",
				cell: (row) => row.membership?.department_name ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "temporaryPassword",
				header: "Temporary password",
				accessor: (row) => row.temporary_password ?? "—",
				cell: (row) => row.temporary_password ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "message",
				header: "Message",
				accessor: (row) => row.message ?? "—",
				cell: (row) => row.message ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
				cellClassName: "text-sm text-muted-foreground",
			},
		],
		[]
	);

	const errorColumns = useMemo<ColumnDefinition<BulkOnboardingErrorItem>[]>(
		() => [
			{
				id: "row",
				header: "Row",
				accessor: (row) => row.row_number,
				cell: (row) => row.row_number,
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
				headerClassName: "w-16",
				cellClassName: "font-medium",
			},
			{
				id: "email",
				header: "Email",
				accessor: (row) => row.email ?? "—",
				cell: (row) => row.email ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "firstName",
				header: "First name",
				accessor: (row) => row.first_name ?? "—",
				cell: (row) => row.first_name ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "lastName",
				header: "Last name",
				accessor: (row) => row.last_name ?? "—",
				cell: (row) => row.last_name ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "employeeId",
				header: "Employee ID",
				accessor: (row) => row.employee_id ?? "—",
				cell: (row) => row.employee_id ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
			},
			{
				id: "error",
				header: "Error",
				accessor: (row) => row.error ?? "—",
				cell: (row) => row.error ?? "—",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
				cellClassName: "text-sm text-muted-foreground",
			},
		],
		[]
	);

	if (successes.length === 0 && errors.length === 0) return null;

	return (
		<div className="space-y-4">
			{successes.length ? (
				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">
						Successful rows
					</p>
					<div className="flex max-h-80 min-h-0 flex-col">
						<DataTable
							data={successes}
							columns={successColumns}
							getRowId={(row) =>
								`success-${row.row_number}-${row.user?.id ?? row.email ?? ""}`
							}
							enableRowSelection={false}
							enableExport={false}
							enableColumnReorder={false}
							pagination={{ enabled: false }}
							emptyMessage="No successful rows."
							className="flex-1 min-h-0"
						/>
					</div>
				</div>
			) : null}
			{errors.length ? (
				<div className="space-y-2">
					<p className="text-sm font-medium text-foreground">Failed rows</p>
					<div className="flex max-h-80 min-h-0 flex-col">
						<DataTable
							data={errors}
							columns={errorColumns}
							getRowId={(row) =>
								`error-${row.row_number}-${row.email ?? row.employee_id ?? ""}`
							}
							enableRowSelection={false}
							enableExport={false}
							enableColumnReorder={false}
							pagination={{ enabled: false }}
							emptyMessage="No failed rows."
							className="flex-1 min-h-0"
						/>
					</div>
				</div>
			) : null}
		</div>
	);
}
