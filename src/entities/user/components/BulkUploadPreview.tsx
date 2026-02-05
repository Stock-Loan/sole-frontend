import { useMemo, useState } from "react";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { Button } from "@/shared/ui/Button";
import type { BulkUploadPreviewProps, BulkUploadPreviewRow } from "../types";

const SENSITIVE_HEADERS = new Set(["temporary_password"]);

function normalizeHeader(value: string) {
	return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function isSensitiveHeader(value: string) {
	return SENSITIVE_HEADERS.has(normalizeHeader(value));
}

export function BulkUploadPreview({ headers, rows }: BulkUploadPreviewProps) {
	const [showSensitiveValues, setShowSensitiveValues] = useState(false);

	const previewRows = useMemo<BulkUploadPreviewRow[]>(
		() =>
			rows.map((row, index) => ({
				id: `preview-row-${index + 1}`,
				rowNumber: index + 1,
				values: row,
			})),
		[rows],
	);

	const sensitiveColumns = useMemo(
		() => headers.map((header) => isSensitiveHeader(header)),
		[headers],
	);
	const hasSensitiveColumns = useMemo(
		() => sensitiveColumns.some(Boolean),
		[sensitiveColumns],
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
				cellClassName: "text-xs font-medium",
			},
			...headers.map<ColumnDefinition<BulkUploadPreviewRow>>(
				(header, index) => {
					const isSensitive = sensitiveColumns[index] ?? false;
					return {
						id: `col-${index}`,
						header,
						accessor: (row: BulkUploadPreviewRow) => row.values[index] ?? "",
						cell: (row: BulkUploadPreviewRow) => {
							const value = row.values[index] ?? "";
							if (!value) return "-";
							if (isSensitive && !showSensitiveValues) {
								return "********";
							}
							return value;
						},
						enableSorting: false,
						enableFiltering: false,
						enableHiding: false,
						headerClassName: "text-xs capitalize whitespace-nowrap",
						cellClassName: "text-xs",
					};
				},
			),
		],
		[headers, sensitiveColumns, showSensitiveValues],
	);

	if (headers.length === 0 || rows.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2">
			{hasSensitiveColumns ? (
				<div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/60 bg-muted/20 px-3 py-2 text-xs text-muted-foreground">
					<span>
						Sensitive columns are hidden in the preview. Click reveal to view
						them.
					</span>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="h-7 px-2 text-xs"
						aria-pressed={showSensitiveValues}
						onClick={() => setShowSensitiveValues((prev) => !prev)}
					>
						{showSensitiveValues ? "Hide sensitive values" : "Reveal values"}
					</Button>
				</div>
			) : null}
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
