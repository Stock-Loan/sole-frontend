import { ArrowDown, ArrowUp, Filter, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuPortal,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { filterOperatorOptions } from "./constants";
import type { DataTableColumnMenuProps, FilterOperator } from "./types";

export function DataTableColumnMenu<T>({
	table,
	column,
	columns,
	visibleDataColumnCount,
	columnVisibility,
	draft,
	isFilterApplied,
	onFilterOperatorChange,
	onFilterValueChange,
	onApplyFilter,
	onClearFilter,
	openMenuColumnId,
	onOpenMenuChange,
	enableColumnReorder,
}: DataTableColumnMenuProps<T>) {
	const canSort = column.getCanSort();
	const canHide = column.getCanHide();
	const canFilter = column.getCanFilter();
	const canReorder = enableColumnReorder && table.getAllLeafColumns().length > 1;

	if (!canSort && !canHide && !canFilter && !canReorder) {
		return null;
	}

	const filterOption = filterOperatorOptions.find(
		(item) => item.value === draft.operator
	);
	const requiresValue = filterOption?.requiresValue ?? true;
	return (
		<DropdownMenu
			open={openMenuColumnId === column.id}
			onOpenChange={(open) => onOpenMenuChange(column.id, open)}
		>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" size="icon" className="relative h-8 w-8">
					<MoreVertical className="h-4 w-4" aria-hidden="true" />
					{isFilterApplied ? (
						<span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />
					) : null}
					<span className="sr-only">
						{isFilterApplied
							? "Column options (filter active)"
							: "Column options"}
					</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-56">
				<DropdownMenuItem
					disabled={!canSort}
					onSelect={() =>
						table.setSorting([{ id: column.id, desc: false }])
					}
				>
					<ArrowUp className="mr-2 h-4 w-4" />
					Sort ascending
				</DropdownMenuItem>
				<DropdownMenuItem
					disabled={!canSort}
					onSelect={() =>
						table.setSorting([{ id: column.id, desc: true }])
					}
				>
					<ArrowDown className="mr-2 h-4 w-4" />
					Sort descending
				</DropdownMenuItem>
				{canReorder ? <DropdownMenuSeparator /> : null}
				<DropdownMenuSub>
					<DropdownMenuSubTrigger>Columns</DropdownMenuSubTrigger>
					<DropdownMenuPortal>
						<DropdownMenuSubContent className="w-64">
							{columns.map((col) => {
								const columnInstance = table.getColumn(col.id);
								if (!columnInstance) return null;
								const isVisible = columnVisibility[col.id] !== false;
								const allowHide = col.enableHiding !== false;
								return (
									<DropdownMenuCheckboxItem
										key={col.id}
										checked={isVisible}
										disabled={
											!allowHide ||
											(isVisible && visibleDataColumnCount <= 1)
										}
										onCheckedChange={(checked) =>
											columnInstance.toggleVisibility(Boolean(checked))
										}
									>
										{col.header}
									</DropdownMenuCheckboxItem>
								);
							})}
						</DropdownMenuSubContent>
					</DropdownMenuPortal>
				</DropdownMenuSub>
				<DropdownMenuSeparator />
				{canFilter ? (
					<DropdownMenuSub>
						<DropdownMenuSubTrigger>Filter</DropdownMenuSubTrigger>
						<DropdownMenuPortal>
							<DropdownMenuSubContent className="w-72">
								<div className="space-y-3 px-2 py-2">
									<div className="space-y-2">
										<Select
											value={draft.operator}
											onValueChange={(value) =>
												onFilterOperatorChange(
													column.id,
													value as FilterOperator
												)
											}
										>
											<SelectTrigger className="h-9">
												<SelectValue placeholder="Choose filter" />
											</SelectTrigger>
											<SelectContent>
												{filterOperatorOptions.map((option) => (
													<SelectItem
														key={option.value}
														value={option.value}
													>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<Input
											value={draft.value}
											onChange={(event) =>
												onFilterValueChange(column.id, event.target.value)
											}
											placeholder={
												requiresValue ? "Enter value" : "No value needed"
											}
											disabled={!requiresValue}
										/>
									</div>
									<div className="flex items-center gap-2">
										<Button
											size="sm"
											className="flex-1"
											onClick={() => onApplyFilter(column.id)}
										>
											<Filter className="mr-2 h-4 w-4" />
											Filter
										</Button>
										<Button
											size="sm"
											variant="outline"
											className="flex-1"
											onClick={() => onClearFilter(column.id)}
										>
											Clear
										</Button>
									</div>
								</div>
							</DropdownMenuSubContent>
						</DropdownMenuPortal>
					</DropdownMenuSub>
				) : (
					<DropdownMenuItem disabled>Filtering is disabled</DropdownMenuItem>
				)}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
