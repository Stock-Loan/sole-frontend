import { flexRender } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@/shared/ui/Table/table";
import { cn } from "@/shared/lib/utils";
import type { DataTableBodyProps } from "./types";

export function DataTableBody<T>({
	table,
	rows,
	columnConfigById,
	emptyMessage,
	rowSelection,
	columnVisibility,
	onRowClick,
}: DataTableBodyProps<T>) {
	const selectionKey = Object.keys(rowSelection).join("|");
	const visibilityKey = Object.keys(columnVisibility)
		.sort((a, b) => a.localeCompare(b))
		.join("|");

	const visibleColumns = table.getVisibleLeafColumns();

	if (!rows.length) {
		return (
			<TableBody
				data-selection={selectionKey || undefined}
				data-visibility={visibilityKey || undefined}
			>
				<TableRow>
					<TableCell
						colSpan={visibleColumns.length}
						className="h-24 text-center text-sm text-muted-foreground"
					>
						{emptyMessage}
					</TableCell>
				</TableRow>
			</TableBody>
		);
	}

	return (
		<TableBody
			data-selection={selectionKey || undefined}
			data-visibility={visibilityKey || undefined}
		>
			{rows.map((row) => (
				<TableRow
					key={row.id}
					data-selected={rowSelection[row.id] ? "true" : undefined}
					onClick={() => onRowClick?.(row.original)}
					className={cn(
						onRowClick && "cursor-pointer hover:bg-muted/40"
					)}
				>
					{visibleColumns.map((column) => {
						let cell = row
							.getAllCells()
							.find((c) => c.column.id === column.id);

						if (!cell) {
							cell = {
								id: `${row.id}_${column.id}`,
								row,
								column,
								table,
								getValue: () => row.getValue(column.id),
								renderValue: () => row.getValue(column.id),
								getContext: () => ({
									table,
									column,
									row,
									cell: cell!,
									getValue: () => row.getValue(column.id),
									renderValue: () => row.getValue(column.id),
								}),
							} as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any
						}

						const config = columnConfigById.get(column.id);
						return (
							<TableCell
								key={cell.id}
								className={config?.cellClassName}
							>
								{flexRender(cell.column.columnDef.cell, {
									...cell.getContext(),
									table,
								})}
							</TableCell>
						);
					})}
				</TableRow>
			))}
		</TableBody>
	);
}
