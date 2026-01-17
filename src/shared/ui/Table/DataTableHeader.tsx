import { useState, type DragEvent } from "react";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { flexRender } from "@tanstack/react-table";
import { TableHead, TableHeader, TableRow } from "@/shared/ui/Table/table";
import { Checkbox } from "@/shared/ui/checkbox";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/Button";
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
	enableColumnReorder,
}: DataTableHeaderProps<T>) {
	const selectionKey = Object.keys(rowSelection).length;
	const [dragOverColumnId, setDragOverColumnId] = useState<string | null>(null);
	const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);

	const getEffectiveOrder = () => {
		const currentOrder = table.getState().columnOrder;
		const allColumnIds = table.getAllLeafColumns().map((col) => col.id);
		return currentOrder.length ? currentOrder : allColumnIds;
	};

	const handleDragStart = (event: DragEvent, columnId: string) => {
		if (!enableColumnReorder) return;
		event.dataTransfer.setData("text/plain", columnId);
		event.dataTransfer.effectAllowed = "move";
		setDraggingColumnId(columnId);
	};

	const handleDragOver = (event: DragEvent, columnId: string) => {
		if (!enableColumnReorder) return;
		if (columnId === selectionColumnId || columnId === draggingColumnId) return;
		event.preventDefault();
		setDragOverColumnId(columnId);
	};

	const handleDragEnd = () => {
		setDragOverColumnId(null);
		setDraggingColumnId(null);
	};

	const handleDrop = (event: DragEvent, targetId: string) => {
		if (!enableColumnReorder) return;
		event.preventDefault();
		const sourceId = event.dataTransfer.getData("text/plain");
		setDragOverColumnId(null);
		setDraggingColumnId(null);
		if (!sourceId || sourceId === targetId) return;
		if (targetId === selectionColumnId || sourceId === selectionColumnId) return;

		const order = getEffectiveOrder();
		const sourceIndex = order.indexOf(sourceId);
		const targetIndex = order.indexOf(targetId);
		if (sourceIndex === -1 || targetIndex === -1) return;

		const nextOrder = order.filter((id) => id !== sourceId);
		let insertIndex = targetIndex;
		if (sourceIndex < targetIndex) {
			insertIndex = targetIndex - 1;
		}
		const targetRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		const insertAfter = event.clientX > targetRect.left + targetRect.width / 2;
		if (insertAfter) {
			insertIndex += 1;
		}
		nextOrder.splice(insertIndex, 0, sourceId);

		const selectionIndex = nextOrder.indexOf(selectionColumnId);
		if (selectionIndex > 0) {
			nextOrder.splice(selectionIndex, 1);
			nextOrder.unshift(selectionColumnId);
		}

		table.setColumnOrder(nextOrder);
	};

	return (
		<TableHeader
			data-selection={selectionKey || undefined}
			className="sticky top-0 z-10 border-b border-border/60 bg-slate-50/90 backdrop-blur supports-[backdrop-filter]:bg-slate-50/70"
		>
			{table.getHeaderGroups().map((headerGroup) => (
				<TableRow key={headerGroup.id}>
					{headerGroup.headers.map((header) => {
						if (header.isPlaceholder) {
							return <TableHead key={header.id} />;
						}

						const config = columnConfigById.get(header.column.id);
						const isSelectionHeader = header.column.id === selectionColumnId;

						if (!config) {
							if (isSelectionHeader) {
								return (
									<TableHead key={header.id} className="relative w-10">
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
								<TableHead key={header.id} className="relative w-10">
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

						const canDrag =
							enableColumnReorder &&
							!isSelectionHeader &&
							table.getAllLeafColumns().length > 1;

						return (
							<TableHead
								key={header.id}
								className={cn(
									"relative",
									dragOverColumnId === header.column.id &&
										"bg-muted/40",
									config.headerClassName
								)}
								onDragOver={(event) =>
									handleDragOver(event, header.column.id)
								}
								onDrop={(event) => handleDrop(event, header.column.id)}
							>
								<div className="flex w-full items-center justify-start gap-2">
									{canDrag ? (
										<Button
											type="button"
											draggable
											onDragStart={(event) =>
												handleDragStart(event, header.column.id)
											}
											onDragEnd={handleDragEnd}
											variant="ghost"
											size="icon"
											className="h-7 w-7 text-muted-foreground hover:bg-muted"
											aria-label="Reorder column"
										>
											<GripVertical className="h-4 w-4" />
										</Button>
									) : null}
									<span className="text-xs font-medium">
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
										enableColumnReorder={enableColumnReorder}
									/>
									{SortIcon ? (
										<SortIcon className="h-3.5 w-3.5 text-muted-foreground" />
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
