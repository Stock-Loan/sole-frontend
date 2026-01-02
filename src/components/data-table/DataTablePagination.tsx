import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { DataTablePaginationProps } from "./types";

export function DataTablePagination<T>({
	table,
	paginationState,
	totalRows,
	totalPages,
	pageSizeOptions,
	showPageSizeSelect,
}: DataTablePaginationProps<T>) {
	const canPreviousPage = paginationState.pageIndex > 0;
	const canNextPage = paginationState.pageIndex + 1 < totalPages;

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3 text-sm text-muted-foreground">
			<div className="flex flex-wrap items-center gap-3">
				<span>
					Showing{" "}
					{totalRows === 0
						? 0
						: paginationState.pageIndex * paginationState.pageSize + 1}
					–
					{Math.min(
						totalRows,
						(paginationState.pageIndex + 1) * paginationState.pageSize
					)}{" "}
					of {totalRows} • Page {paginationState.pageIndex + 1} of {totalPages}
				</span>
				{showPageSizeSelect ? (
					<div className="flex items-center gap-2">
						<span>Rows per page</span>
						<Select
							value={String(paginationState.pageSize)}
							onValueChange={(value) => {
								const nextSize = Number(value);
								if (Number.isNaN(nextSize)) return;
								table.setPageSize(nextSize);
							}}
						>
						<SelectTrigger className="h-10 w-[90px] text-xs">
							<SelectValue />
						</SelectTrigger>
							<SelectContent>
								{pageSizeOptions.map((size) => (
									<SelectItem key={size} value={String(size)}>
										{size}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				) : null}
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={!canPreviousPage}
					onClick={() => table.previousPage()}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!canNextPage}
					onClick={() => table.nextPage()}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
