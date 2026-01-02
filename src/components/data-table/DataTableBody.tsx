import { flexRender } from "@tanstack/react-table";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import type { DataTableBodyProps } from "./types";

export function DataTableBody<T>({
	table,
	columnConfigById,
	emptyMessage,
}: DataTableBodyProps<T>) {
	if (!table.getRowModel().rows.length) {
		return (
			<TableBody>
				<TableRow>
					<TableCell
						colSpan={table.getVisibleLeafColumns().length}
						className="h-24 text-center text-sm text-muted-foreground"
					>
						{emptyMessage}
					</TableCell>
				</TableRow>
			</TableBody>
		);
	}

	return (
		<TableBody>
			{table.getRowModel().rows.map((row) => (
				<TableRow key={row.id}>
					{row.getVisibleCells().map((cell) => {
						const config = columnConfigById.get(cell.column.id);
						return (
							<TableCell key={cell.id} className={config?.cellClassName}>
								{flexRender(cell.column.columnDef.cell, cell.getContext())}
							</TableCell>
						);
					})}
				</TableRow>
			))}
		</TableBody>
	);
}
