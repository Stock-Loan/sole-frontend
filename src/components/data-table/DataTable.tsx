import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ArrowDown,
	ArrowUp,
	Download,
	Filter,
	MoreVertical,
	X,
} from "lucide-react";
import {
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type FilterFn,
	type PaginationState,
	type Row,
	type RowSelectionState,
	type SortingFn,
	type SortingState,
	type VisibilityState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarSeparator,
} from "@/components/ui/toolbar";
import { LoadingState } from "@/components/common/LoadingState";
import { cn } from "@/lib/utils";
import type {
	ColumnConfigMap,
	ColumnDefinition,
	ColumnFilterState,
	DataTableProps,
	FilterOperator,
} from "./types";
import {
	applyFilterOperator,
	compareValues,
	defaultPageSize,
	defaultPageSizeOptions,
	defaultFilterState,
	escapeCsvValue,
	filterOperatorOptions,
	getAccessorValueFromConfig,
	isColumnFilterState,
	isFilterActive,
	normalizeSortValue,
	selectionColumnId,
	stringifyCsvValue,
} from "./constants";

export function DataTable<T>({
	data,
	columns,
	getRowId,
	isLoading = false,
	emptyMessage = "No results",
	className,
	enableRowSelection = true,
	enableExport = true,
	exportFileName = "export.csv",
	onSelectionChange,
	toolbarActions,
	renderToolbarActions,
	pagination,
}: DataTableProps<T>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [openMenuColumnId, setOpenMenuColumnId] = useState<string | null>(null);
	const paginationEnabled = pagination?.enabled ?? true;
	const initialPageSize = pagination?.pageSize ?? defaultPageSize;
	const [paginationState, setPaginationState] = useState<PaginationState>(
		() => ({
			pageIndex: 0,
			pageSize: initialPageSize,
		})
	);
	const [filterDrafts, setFilterDrafts] = useState<
		Record<string, ColumnFilterState>
	>({});

	const columnConfigById = useMemo<ColumnConfigMap<T>>(
		() => new Map(columns.map((column) => [column.id, column])),
		[columns]
	);

	const appliedFilters = useMemo<Record<string, ColumnFilterState>>(() => {
		const next: Record<string, ColumnFilterState> = {};
		columnFilters.forEach((filter) => {
			if (isColumnFilterState(filter.value)) {
				next[filter.id] = filter.value;
			}
		});
		return next;
	}, [columnFilters]);

	const getDraftFilter = useCallback(
		(columnId: string) =>
			filterDrafts[columnId] ?? appliedFilters[columnId] ?? defaultFilterState,
		[appliedFilters, filterDrafts]
	);

	const advancedTextFilterFn: FilterFn<T> = useCallback(
		(row, columnId, filterValue) => {
			const config = columnConfigById.get(columnId);
			const activeFilter = isColumnFilterState(filterValue)
				? filterValue
				: defaultFilterState;
			const accessor = config?.filterAccessor ?? config?.accessor;
			let cellValue: unknown;
			if (typeof accessor === "function") {
				cellValue = accessor(row.original);
			} else if (typeof accessor === "string") {
				cellValue = (row.original as Record<string, unknown>)[accessor];
			} else {
				cellValue = row.getValue(columnId);
			}
			return applyFilterOperator(
				activeFilter.operator,
				cellValue,
				activeFilter.value
			);
		},
		[columnConfigById]
	);
	advancedTextFilterFn.autoRemove = (value: unknown) =>
		!isColumnFilterState(value) || !isFilterActive(value as ColumnFilterState);

	const advancedSortingFn: SortingFn<T> = useCallback(
		(rowA, rowB, columnId) => {
			const config = columnConfigById.get(columnId);
			const aValue = getAccessorValueFromConfig(
				rowA.original,
				config,
				columnId,
				rowA
			);
			const bValue = getAccessorValueFromConfig(
				rowB.original,
				config,
				columnId,
				rowB
			);
			const normalizedA = normalizeSortValue(
				config?.sortAccessor ? config.sortAccessor(rowA.original) : aValue
			);
			const normalizedB = normalizeSortValue(
				config?.sortAccessor ? config.sortAccessor(rowB.original) : bValue
			);
			return compareValues(normalizedA, normalizedB);
		},
		[columnConfigById]
	);

	const dataColumns = useMemo<ColumnDef<T, unknown>[]>(
		() =>
			columns.map((column) => {
				const accessorKey =
					typeof column.accessor === "string"
						? (column.accessor as keyof T & string)
						: undefined;
				const accessorFn =
					typeof column.accessor === "function" ? column.accessor : undefined;
				const hasAccessor = Boolean(accessorFn || accessorKey);
				const canSort =
					column.enableSorting !== false &&
					(Boolean(column.sortAccessor) || hasAccessor);
				const canFilter =
					column.enableFiltering !== false &&
					(Boolean(column.filterAccessor) || hasAccessor);
				const headerTemplate =
					typeof column.header === "string"
						? column.header
						: () => column.header;

				const baseColumn: ColumnDef<T, unknown> = {
					id: column.id,
					header: headerTemplate,
					cell: ({ row, getValue }) =>
						column.cell ? column.cell(row.original) : getValue() ?? "—",
					enableSorting: canSort,
					enableHiding: column.enableHiding !== false,
					enableColumnFilter: canFilter,
					sortingFn: advancedSortingFn,
					filterFn: advancedTextFilterFn,
				};

				if (accessorFn) {
					return {
						...baseColumn,
						accessorFn,
					};
				}

				if (accessorKey) {
					return {
						...baseColumn,
						accessorKey,
					};
				}

				return baseColumn;
			}),
		[advancedSortingFn, advancedTextFilterFn, columns]
	);

	const selectionColumn = useMemo<ColumnDef<T, unknown>>(
		() => ({
			id: selectionColumnId,
			header: ({ table }) => (
				<Checkbox
					checked={table.getIsAllPageRowsSelected()}
					indeterminate={table.getIsSomePageRowsSelected()}
					onCheckedChange={(checked) =>
						table.toggleAllPageRowsSelected(Boolean(checked))
					}
					aria-label="Select all rows"
				/>
			),
			cell: ({ row }) => (
				<Checkbox
					checked={row.getIsSelected()}
					disabled={!row.getCanSelect()}
					onCheckedChange={(checked) => row.toggleSelected(Boolean(checked))}
					aria-label="Select row"
				/>
			),
			enableSorting: false,
			enableHiding: false,
			meta: {
				isSelection: true,
			},
		}),
		[]
	);

	const tableColumns = useMemo(
		() =>
			enableRowSelection ? [selectionColumn, ...dataColumns] : dataColumns,
		[enableRowSelection, dataColumns, selectionColumn]
	);

	// eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table uses internal functions that React Compiler skips.
	const table = useReactTable({
		data,
		columns: tableColumns,
		state: {
			sorting,
			columnVisibility,
			rowSelection,
			columnFilters,
			...(paginationEnabled ? { pagination: paginationState } : {}),
		},
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		...(paginationEnabled ? { onPaginationChange: setPaginationState } : {}),
		enableRowSelection,
		getRowId: (row, index) => (getRowId ? getRowId(row, index) : String(index)),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(paginationEnabled
			? { getPaginationRowModel: getPaginationRowModel() }
			: {}),
	});

	const visibleDataColumns = useMemo(
		() =>
			table
				.getVisibleLeafColumns()
				.filter((column) => column.id !== selectionColumnId),
		[table]
	);

	const visibleDataColumnCount = visibleDataColumns.length;

	const selectedRows = table.getSelectedRowModel().rows;
	const selectedRowData = useMemo(
		() => selectedRows.map((row) => row.original),
		[selectedRows]
	);
	const selectionCount = selectedRows.length;
	const totalRows = table.getFilteredRowModel().rows.length;
	const currentPage = paginationState.pageIndex + 1;
	const totalPages = paginationEnabled ? Math.max(1, table.getPageCount()) : 1;
	const showSelectionToolbar = enableRowSelection && selectionCount > 0;
	const pageSizeOptions = useMemo(() => {
		const options = pagination?.pageSizeOptions ?? defaultPageSizeOptions;
		return Array.from(new Set([...options, paginationState.pageSize])).sort(
			(a, b) => a - b
		);
	}, [pagination?.pageSizeOptions, paginationState.pageSize]);

	useEffect(() => {
		if (!enableRowSelection) {
			setRowSelection({});
		}
	}, [enableRowSelection]);

	useEffect(() => {
		if (!paginationEnabled) return;
		const nextPageSize = pagination?.pageSize;
		if (typeof nextPageSize !== "number") return;
		setPaginationState((prev) =>
			prev.pageSize === nextPageSize
				? prev
				: { ...prev, pageIndex: 0, pageSize: nextPageSize }
		);
	}, [pagination?.pageSize, paginationEnabled]);

	useEffect(() => {
		if (!enableRowSelection) return;
		if (onSelectionChange) {
			onSelectionChange(selectedRowData);
		}
	}, [enableRowSelection, onSelectionChange, selectedRowData]);

	const toolbarContent = showSelectionToolbar
		? renderToolbarActions
			? renderToolbarActions(selectedRowData)
			: toolbarActions
		: null;

	const handleFilterOperatorChange = (
		columnId: string,
		operator: FilterOperator
	) => {
		const current = getDraftFilter(columnId);
		setFilterDrafts((prev) => ({
			...prev,
			[columnId]: { ...current, operator },
		}));
	};

	const handleFilterValueChange = (columnId: string, value: string) => {
		const current = getDraftFilter(columnId);
		setFilterDrafts((prev) => ({
			...prev,
			[columnId]: { ...current, value },
		}));
	};

	const applyFilter = (columnId: string) => {
		const column = table.getColumn(columnId);
		if (!column) return;
		const draft = getDraftFilter(columnId);
		if (!isFilterActive(draft)) {
			column.setFilterValue(undefined);
			setOpenMenuColumnId(null);
			return;
		}
		column.setFilterValue(draft);
		setOpenMenuColumnId(null);
	};

	const clearFilter = (columnId: string) => {
		const column = table.getColumn(columnId);
		if (!column) return;
		column.setFilterValue(undefined);
		setFilterDrafts((prev) => {
			const next = { ...prev };
			delete next[columnId];
			return next;
		});
		setOpenMenuColumnId(null);
	};

	const getExportLabel = (
		config: ColumnDefinition<T> | undefined,
		id: string
	) => {
		if (config?.exportLabel) return config.exportLabel;
		if (typeof config?.header === "string") return config.header;
		return id;
	};

	const getExportValue = (
		row: Row<T>,
		columnId: string,
		config?: ColumnDefinition<T>
	) => {
		if (config?.exportAccessor) {
			return stringifyCsvValue(config.exportAccessor(row.original));
		}
		if (config?.accessor) {
			return stringifyCsvValue(
				getAccessorValueFromConfig(row.original, config, columnId, row)
			);
		}
		return stringifyCsvValue(row.getValue(columnId));
	};

	const exportRows = (rows: Row<T>[]) => {
		if (!enableExport || rows.length === 0) return;
		const exportColumns = visibleDataColumns.filter((column) => {
			const config = columnConfigById.get(column.id);
			return config?.enableExport !== false;
		});
		const headers = exportColumns.map((column) =>
			escapeCsvValue(getExportLabel(columnConfigById.get(column.id), column.id))
		);
		const csvRows = rows.map((row) =>
			exportColumns
				.map((column) =>
					escapeCsvValue(
						getExportValue(row, column.id, columnConfigById.get(column.id))
					)
				)
				.join(",")
		);
		const csv = [headers.join(","), ...csvRows].join("\n");
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = exportFileName;
		anchor.click();
		URL.revokeObjectURL(url);
	};

	const exportSelectedRows = () => exportRows(selectedRows);
	const exportAllRows = () => exportRows(table.getSortedRowModel().rows);

	if (isLoading) {
		return <LoadingState />;
	}

	return (
		<div className={cn("rounded-md border border-border/70", className)}>
			{enableExport ? (
				<div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
					<div className="ml-auto flex flex-wrap items-center gap-2">
						<Button variant="outline" size="sm" onClick={exportAllRows}>
							<Download className="mr-2 h-4 w-4" />
							Export all
						</Button>
					</div>
				</div>
			) : null}
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => {
								if (header.isPlaceholder) {
									return <TableHead key={header.id} />;
								}

								const config = columnConfigById.get(header.column.id);

								if (!config) {
									return (
										<TableHead key={header.id} className="w-10">
											{flexRender(
												header.column.columnDef.header,
												header.getContext()
											)}
										</TableHead>
									);
								}

								const canSort = header.column.getCanSort();
								const canHide = header.column.getCanHide();
								const canFilter = header.column.getCanFilter();
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
								const filterOption = filterOperatorOptions.find(
									(item) => item.value === draft.operator
								);
								const requiresValue = filterOption?.requiresValue ?? true;

								return (
									<TableHead key={header.id} className={config.headerClassName}>
										<div className="flex items-center justify-between gap-2">
											<span className="text-sm font-semibold">
												{config.header}
											</span>
											{canSort || canHide || canFilter ? (
												<DropdownMenu
													open={openMenuColumnId === header.column.id}
													onOpenChange={(open) =>
														setOpenMenuColumnId(
															open ? header.column.id : null
														)
													}
												>
													<DropdownMenuTrigger asChild>
														<Button
															variant="ghost"
															size="icon"
															className="relative h-8 w-8"
														>
															<MoreVertical
																className="h-4 w-4"
																aria-hidden="true"
															/>
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
													<DropdownMenuContent align="end" className="w-46">
														<DropdownMenuItem
															disabled={!canSort}
															onClick={() => header.column.toggleSorting(false)}
														>
															<ArrowUp className="mr-2 h-4 w-4" />
															Sort ascending
														</DropdownMenuItem>
														<DropdownMenuItem
															disabled={!canSort}
															onClick={() => header.column.toggleSorting(true)}
														>
															<ArrowDown className="mr-2 h-4 w-4" />
															Sort descending
														</DropdownMenuItem>
														<DropdownMenuSeparator />
														<DropdownMenuSub>
															<DropdownMenuSubTrigger>
																Columns
															</DropdownMenuSubTrigger>
															<DropdownMenuPortal>
																<DropdownMenuSubContent className="w-64">
																	{columns.map((col) => {
																		const columnInstance = table.getColumn(
																			col.id
																		);
																		if (!columnInstance) return null;
																		const isVisible =
																			columnInstance.getIsVisible();
																		const allowHide =
																			col.enableHiding !== false;
																		return (
																			<DropdownMenuCheckboxItem
																				key={col.id}
																				checked={isVisible}
																				disabled={
																					!allowHide ||
																					(isVisible &&
																						visibleDataColumnCount <= 1)
																				}
																				onCheckedChange={(checked) =>
																					columnInstance.toggleVisibility(
																						Boolean(checked)
																					)
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
																<DropdownMenuSubTrigger>
																	Filter
																</DropdownMenuSubTrigger>
																<DropdownMenuPortal>
																	<DropdownMenuSubContent className="w-72">
																		<div className="space-y-3 px-2 py-2">
																			<div className="space-y-2">
																				<Select
																					value={draft.operator}
																					onValueChange={(value) =>
																						handleFilterOperatorChange(
																							header.column.id,
																							value as FilterOperator
																						)
																					}
																				>
																					<SelectTrigger className="h-9">
																						<SelectValue placeholder="Choose filter" />
																					</SelectTrigger>
																					<SelectContent>
																						{filterOperatorOptions.map(
																							(option) => (
																								<SelectItem
																									key={option.value}
																									value={option.value}
																								>
																									{option.label}
																								</SelectItem>
																							)
																						)}
																					</SelectContent>
																				</Select>
																				<Input
																					value={draft.value}
																					onChange={(event) =>
																						handleFilterValueChange(
																							header.column.id,
																							event.target.value
																						)
																					}
																					placeholder={
																						requiresValue
																							? "Enter value"
																							: "No value needed"
																					}
																					disabled={!requiresValue}
																				/>
																			</div>
																			<div className="flex items-center gap-2">
																				<Button
																					size="sm"
																					className="flex-1"
																					onClick={() =>
																						applyFilter(header.column.id)
																					}
																				>
																					<Filter className="mr-2 h-4 w-4" />
																					Filter
																				</Button>
																				<Button
																					size="sm"
																					variant="outline"
																					className="flex-1"
																					onClick={() =>
																						clearFilter(header.column.id)
																					}
																				>
																					Clear
																				</Button>
																			</div>
																		</div>
																	</DropdownMenuSubContent>
																</DropdownMenuPortal>
															</DropdownMenuSub>
														) : (
															<DropdownMenuItem disabled>
																Filtering is disabled
															</DropdownMenuItem>
														)}
													</DropdownMenuContent>
												</DropdownMenu>
											) : null}
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
				<TableBody>
					{table.getRowModel().rows.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow key={row.id}>
								{row.getVisibleCells().map((cell) => {
									const config = columnConfigById.get(cell.column.id);
									return (
										<TableCell key={cell.id} className={config?.cellClassName}>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext()
											)}
										</TableCell>
									);
								})}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getVisibleLeafColumns().length}
								className="h-24 text-center text-sm text-muted-foreground"
							>
								{emptyMessage}
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
			{paginationEnabled ? (
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
							of {totalRows} • Page {currentPage} of {totalPages}
						</span>
						{pagination?.showPageSizeSelect === false ? null : (
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
									<SelectTrigger className="h-8 w-[90px]">
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
						)}
					</div>
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={!table.getCanPreviousPage()}
							onClick={() => table.previousPage()}
						>
							Previous
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!table.getCanNextPage()}
							onClick={() => table.nextPage()}
						>
							Next
						</Button>
					</div>
				</div>
			) : null}
			{showSelectionToolbar ? (
				<div className="pointer-events-none fixed bottom-4 left-1/2 z-40 w-fit max-w-[calc(100vw-2rem)] -translate-x-1/2">
					<Toolbar className="pointer-events-auto w-fit max-w-full flex-wrap rounded-lg border border-border/70 bg-background/95 px-3 py-2 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-2">
						<ToolbarGroup className="text-sm font-medium text-foreground">
							<span>{selectionCount} selected</span>
							<ToolbarButton
								variant="ghost"
								size="sm"
								className="h-7 px-2"
								onClick={() => table.resetRowSelection()}
							>
								<X className="mr-1 h-4 w-4" />
								Clear
							</ToolbarButton>
						</ToolbarGroup>
						{enableExport || toolbarContent ? (
							<>
								<ToolbarSeparator />
								<ToolbarGroup className="ml-auto">
									{enableExport ? (
										<ToolbarButton
											variant="outline"
											size="sm"
											onClick={exportSelectedRows}
										>
											<Download className="mr-2 h-4 w-4" />
											Export selected
										</ToolbarButton>
									) : null}
									{toolbarContent}
								</ToolbarGroup>
							</>
						) : null}
					</Toolbar>
				</div>
			) : null}
		</div>
	);
}
