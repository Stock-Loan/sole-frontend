import { useMemo } from "react";
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDefinition } from "@/components/data-table/types";
import type { BulkUploadPreviewProps, BulkUploadPreviewRow } from "../types";

export function BulkUploadPreview({ headers, rows }: BulkUploadPreviewProps) {
	if (headers.length === 0 || rows.length === 0) {
		return null;
	}

	const previewRows = useMemo<BulkUploadPreviewRow[]>(
		() =>
			rows.map((row, index) => ({
				id: `preview-row-${index + 1}`,
				rowNumber: index + 1,
				values: row,
			})),
		[rows]
	);

	const previewColumns = useMemo<ColumnDefinition<BulkUploadPreviewRow>[]>(
		() => [
			{
				id: "rowNumber",
				header: "#",
				accessor: (row) => row.rowNumber,
				cell: (row) => row.rowNumber,
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
				headerClassName: "w-12 min-w-[3rem] text-xs",
				cellClassName: "text-xs font-semibold",
			},
			...headers.map((header, index) => ({
				id: `col-${index}`,
				header,
				accessor: (row) => row.values[index] ?? "",
				cell: (row) => row.values[index] ?? "",
				enableSorting: false,
				enableFiltering: false,
				enableHiding: false,
				headerClassName: "text-xs capitalize whitespace-nowrap",
				cellClassName: "text-xs",
			})),
		],
		[headers]
	);

	return (
		<div className="space-y-2">
			<div className="flex max-h-[60vh] min-h-0 flex-col">
				<DataTable
					data={previewRows}
					columns={previewColumns}
					getRowId={(row) => row.id}
					enableRowSelection={false}
					enableExport={false}
					enableColumnReorder={false}
					pagination={{ enabled: false }}
					className="flex-1 min-h-0"
					emptyMessage="No preview rows available."
				/>
			</div>
			<p className="text-[11px] text-muted-foreground">
				Showing first {rows.length} rows from the uploaded file.
			</p>
		</div>
	);
}
