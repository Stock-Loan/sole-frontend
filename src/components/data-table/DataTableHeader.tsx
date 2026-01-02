import { ArrowDown, ArrowUp } from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { isFilterActive, selectionColumnId } from "./constants";
import { DataTableColumnMenu } from "./DataTableColumnMenu";
import type { DataTableHeaderProps } from "./types";

export function DataTableHeader<T>({
	table,
	columns,
	columnConfigById,
	visibleDataColumnCount,
	columnVisibility,
	rowSelection,
	selectionState,
	appliedFilters,
	getDraftFilter,
	onFilterOperatorChange,
	onFilterValueChange,
	onApplyFilter,
	onClearFilter,
	openMenuColumnId,
	onOpenMenuChange,
}: DataTableHeaderProps<T>) {
	const selectionKey = Object.keys(rowSelection).length;

	return (
		<TableHeader data-selection={selectionKey || undefined}>
			{table.getHeaderGroups().map((headerGroup) => (
				<TableRow key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						if (header.isPlaceholder) {
							return <TableHead key={header.id} />;
						}

						const config = columnConfigById.get(header.column.id);

						if (!config) {
							if (header.column.id === selectionColumnId) {
								return (
									<TableHead key={header.id} className="w-10">
										<Checkbox
											checked={selectionState.allSelected}
											indeterminate={selectionState.someSelected}
											onCheckedChange={(checked) =>
												table.toggleAllPageRowsSelected(Boolean(checked))
											}
											aria-label="Select all rows"
										/>
									</TableHead>
								);
							}
							return (
								<TableHead key={header.id} className="w-10">
									{flexRender(header.column.columnDef.header, {
										...header.getContext(),
										table,
									})}
								</TableHead>
							);
						}

						const sortState = header.column.getIsSorted();
						const SortIcon =
							sortState === "asc"
								? ArrowUp
								: sortState === "desc"
								? ArrowDown
								: null;
						const draft = getDraftFilter(header.column.id);
						const appliedFilter = appliedFilters[header.column.id];
						const isFilterApplied = appliedFilter
							? isFilterActive(appliedFilter)
							: false;

						return (
							<TableHead key={header.id} className={config.headerClassName}>
								<div className="flex items-center gap-1">
									<span className="text-sm font-semibold">
										{config.header}
									</span>
									<DataTableColumnMenu
										table={table}
										column={header.column}
										columns={columns}
										visibleDataColumnCount={visibleDataColumnCount}
										columnVisibility={columnVisibility}
										draft={draft}
										isFilterApplied={isFilterApplied}
										onFilterOperatorChange={onFilterOperatorChange}
										onFilterValueChange={onFilterValueChange}
										onApplyFilter={onApplyFilter}
										onClearFilter={onClearFilter}
										openMenuColumnId={openMenuColumnId}
										onOpenMenuChange={onOpenMenuChange}
									/>
									{SortIcon ? (
										<SortIcon className="h-3.5 w-3.5 text-muted-foreground ml-auto" />
									) : null}
								</div>
							</TableHead>
						);
					})}
				</TableRow>
			))}
		</TableHeader>
	);
}
