import { useCallback, useEffect, useMemo, useState } from "react";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type ColumnOrderState,
	type PaginationState,
	type Row,
	type RowSelectionState,
	type SortingState,
	type VisibilityState,
} from "@tanstack/react-table";
import { Checkbox } from "@/shared/ui/checkbox";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/Table/table";
import { Skeleton } from "@/shared/ui/Skeleton";
import { cn } from "@/shared/lib/utils";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { DataTableBody } from "./DataTableBody";
import { DataTableHeader } from "./DataTableHeader";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableSelectionToolbar } from "./DataTableSelectionToolbar";
import { DataTableTopBar } from "./DataTableTopBar";
import { useDataTableFilterState } from "./hooks";
import type {
	ColumnConfigMap,
	DataTableProps,
	DataTableSkeletonProps,
} from "./types";
import {
	defaultPageSize,
	defaultPageSizeOptions,
	isFilterActive,
	loadDataTablePreferences,
	normalizeColumnOrder,
	resolveDataTablePreferencesKey,
	saveDataTablePreferences,
	selectionColumnId,
} from "./constants";
import {
	buildDataColumns,
	createAdvancedSortingFn,
	createAdvancedTextFilterFn,
	exportRowsToCsv,
} from "./utils";

function buildSelectionColumn<T>(): ColumnDef<T, unknown> {
	return {
		id: selectionColumnId,
		header: ({ table }) => {
			const { rowSelection } = table.getState();
			const rows = table.getRowModel().rows;
			const allSelected =
				rows.length > 0 && rows.every((row) => rowSelection[row.id]);
			const someSelected =
				!allSelected && rows.some((row) => rowSelection[row.id]);

			return (
				<Checkbox
					checked={allSelected || (someSelected && "indeterminate")}
					onCheckedChange={(checked) =>
						table.toggleAllPageRowsSelected(Boolean(checked))
					}
					aria-label="Select all rows"
				/>
			);
		},
		cell: ({ row, table }) => (
			<Checkbox
				checked={row.getIsSelected() || !!table.getState().rowSelection[row.id]}
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
	};
}

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
	onRowClick,
	toolbarActions,
	renderToolbarActions,
	topBarActions,
	pagination,
	search,
	preferences,
	enableColumnReorder = true,
	initialColumnVisibility,
	selectionResetKey,
}: DataTableProps<T>) {
	const preferencesConfig = useMemo(() => preferences ?? null, [preferences]);
	const preferencesKey = useMemo(
		() =>
			preferencesConfig
				? resolveDataTablePreferencesKey(preferencesConfig)
				: null,
		[preferencesConfig]
	);
	const storedPreferences = useMemo(
		() =>
			preferencesConfig ? loadDataTablePreferences(preferencesConfig) : null,
		[preferencesConfig]
	);

	const dataColumnIds = useMemo(
		() => columns.map((column) => column.id),
		[columns]
	);
	const persistedPageSize = storedPreferences?.pagination?.pageSize;
	const persistedPageIndex = storedPreferences?.pagination?.pageIndex;
	const baseVisibility = useMemo(
		() => initialColumnVisibility ?? {},
		[initialColumnVisibility]
	);
	const storedVisibility = storedPreferences?.columnVisibility ?? {};

	const [sorting, setSorting] = useState<SortingState>(
		() => storedPreferences?.sorting ?? []
	);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
		() => ({ ...baseVisibility, ...storedVisibility })
	);
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
		() => storedPreferences?.columnFilters ?? []
	);
	const [columnOrder, setColumnOrder] = useState<ColumnOrderState>(() =>
		normalizeColumnOrder(
			storedPreferences?.columnOrder,
			dataColumnIds,
			enableRowSelection
		)
	);
	const paginationEnabled = pagination?.enabled ?? true;
	const paginationMode = pagination?.mode ?? "client";
	const isServerPagination = paginationMode === "server";
	const initialPageSize =
		persistedPageSize ?? pagination?.pageSize ?? defaultPageSize;
	const initialPageIndex =
		preferencesConfig?.persistPageIndex &&
		typeof persistedPageIndex === "number"
			? persistedPageIndex
			: 0;
	const [internalPaginationState, setInternalPaginationState] =
		useState<PaginationState>(() => ({
			pageIndex: initialPageIndex,
			pageSize: initialPageSize,
		}));
	const resolvedPaginationState = pagination?.state ?? internalPaginationState;

	const handlePaginationChange = useCallback(
		(
			updater:
				| PaginationState
				| ((previous: PaginationState) => PaginationState)
		) => {
			const nextState =
				typeof updater === "function"
					? updater(resolvedPaginationState)
					: updater;
			if (!pagination?.state) {
				setInternalPaginationState(nextState);
			}
			pagination?.onPaginationChange?.(nextState);
		},
		[pagination, resolvedPaginationState]
	);

	useEffect(() => {
		if (!preferencesConfig || !preferencesKey) return;
		const nextPreferences = loadDataTablePreferences(preferencesConfig);
		const allowedIds = new Set(dataColumnIds);
		if (enableRowSelection) {
			allowedIds.add(selectionColumnId);
		}
		const sanitizedSorting =
			nextPreferences?.sorting?.filter((item) => allowedIds.has(item.id)) ??
			[];
		const sanitizedFilters =
			nextPreferences?.columnFilters?.filter((item) =>
				allowedIds.has(item.id)
			) ?? [];
		const visibilitySource = nextPreferences?.columnVisibility ?? {};
		const sanitizedVisibility = Object.fromEntries(
			Object.entries(visibilitySource).filter(([id]) => allowedIds.has(id))
		);
		const mergedVisibility = { ...baseVisibility, ...sanitizedVisibility };
		setSorting(sanitizedSorting);
		setColumnVisibility(mergedVisibility);
		setColumnFilters(sanitizedFilters);
		setColumnOrder(
			normalizeColumnOrder(
				nextPreferences?.columnOrder,
				dataColumnIds,
				enableRowSelection
			)
		);

		if (!pagination?.state) {
			const nextPageSize =
				nextPreferences?.pagination?.pageSize ??
				pagination?.pageSize ??
				defaultPageSize;
			const nextPageIndex =
				preferencesConfig?.persistPageIndex &&
				typeof nextPreferences?.pagination?.pageIndex === "number"
					? nextPreferences.pagination.pageIndex
					: 0;
			setInternalPaginationState({
				pageIndex: nextPageIndex,
				pageSize: nextPageSize,
			});
		}
	}, [
		dataColumnIds,
		enableRowSelection,
		baseVisibility,
		pagination?.pageSize,
		pagination?.state,
		preferencesConfig,
		preferencesConfig?.persistPageIndex,
		preferencesKey,
	]);

	const columnConfigById = useMemo<ColumnConfigMap<T>>(
		() => new Map(columns.map((column) => [column.id, column])),
		[columns]
	);

	const advancedTextFilterFn = useMemo(
		() => createAdvancedTextFilterFn(columnConfigById),
		[columnConfigById]
	);
	const advancedSortingFn = useMemo(
		() => createAdvancedSortingFn(columnConfigById),
		[columnConfigById]
	);
	const dataColumns = useMemo(
		() => buildDataColumns(columns, advancedSortingFn, advancedTextFilterFn),
		[advancedSortingFn, advancedTextFilterFn, columns]
	);
	const selectionColumn = useMemo(() => buildSelectionColumn<T>(), []);

	const tableColumns = useMemo(
		() =>
			enableRowSelection ? [selectionColumn, ...dataColumns] : dataColumns,
		[enableRowSelection, dataColumns, selectionColumn]
	);

	useEffect(() => {
		if (columnOrder.length === 0) return;
		const normalized = normalizeColumnOrder(
			columnOrder,
			dataColumnIds,
			enableRowSelection
		);
		if (normalized.join("|") !== columnOrder.join("|")) {
			setColumnOrder(normalized);
		}
	}, [columnOrder, dataColumnIds, enableRowSelection]);

	const serverTotalRows = pagination?.totalRows ?? data.length;
	const serverPageCount = Math.max(
		1,
		Math.ceil(serverTotalRows / resolvedPaginationState.pageSize)
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
			columnOrder,
			...(paginationEnabled ? { pagination: resolvedPaginationState } : {}),
		},
		onSortingChange: setSorting,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onColumnFiltersChange: setColumnFilters,
		onColumnOrderChange: setColumnOrder,
		...(paginationEnabled
			? {
					onPaginationChange: handlePaginationChange,
					manualPagination: isServerPagination,
					pageCount: isServerPagination
						? pagination?.pageCount ?? serverPageCount
						: undefined,
			  }
			: {}),
		enableRowSelection,
		getRowId: (row, index) => (getRowId ? getRowId(row, index) : String(index)),
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		...(paginationEnabled && !isServerPagination
			? { getPaginationRowModel: getPaginationRowModel() }
			: {}),
	});

	const {
		appliedFilters,
		getDraftFilter,
		handleFilterOperatorChange,
		handleFilterValueChange,
		applyFilter,
		clearFilter,
		openMenuColumnId,
		handleOpenMenuChange,
	} = useDataTableFilterState(table, columnFilters);

	const visibleDataColumns = table
		.getVisibleLeafColumns()
		.filter((column) => column.id !== selectionColumnId);

	const visibleDataColumnCount = visibleDataColumns.length;

	const selectedRows = table.getSelectedRowModel().rows;
	const selectedRowData = useMemo(
		() => selectedRows.map((row) => row.original),
		[selectedRows]
	);
	const selectionCount = selectedRows.length;
	const displayRows = isServerPagination
		? table.getSortedRowModel().rows
		: table.getRowModel().rows;
	const pageRowIds = useMemo(
		() => displayRows.map((row) => row.id),
		[displayRows]
	);
	const selectionState = useMemo(() => {
		if (pageRowIds.length === 0) {
			return { allSelected: false, someSelected: false };
		}
		const allSelected = pageRowIds.every((id) => rowSelection[id]);
		const someSelected = pageRowIds.some((id) => rowSelection[id]);
		return { allSelected, someSelected: someSelected && !allSelected };
	}, [pageRowIds, rowSelection]);
	const filteredRowCount = table.getFilteredRowModel().rows.length;
	const hasActiveFilters = useMemo(
		() => Object.values(appliedFilters).some((filter) => isFilterActive(filter)),
		[appliedFilters]
	);
	const totalRows = isServerPagination
		? hasActiveFilters
			? filteredRowCount
			: serverTotalRows
		: filteredRowCount;
	const totalPages = paginationEnabled
		? isServerPagination
			? hasActiveFilters
				? Math.max(
						1,
						Math.ceil(filteredRowCount / resolvedPaginationState.pageSize)
				  )
				: pagination?.pageCount ?? serverPageCount
			: Math.max(1, table.getPageCount())
		: 1;
	const paginationDisplayState = useMemo(() => {
		if (!paginationEnabled) return resolvedPaginationState;
		if (isServerPagination && hasActiveFilters) {
			return { ...resolvedPaginationState, pageIndex: 0 };
		}
		return resolvedPaginationState;
	}, [
		hasActiveFilters,
		isServerPagination,
		paginationEnabled,
		resolvedPaginationState,
	]);
	const showSelectionToolbar = enableRowSelection && selectionCount > 0;
	const pageSizeOptions = useMemo(() => {
		const options = pagination?.pageSizeOptions ?? defaultPageSizeOptions;
		return Array.from(
			new Set([...options, resolvedPaginationState.pageSize])
		).sort((a, b) => a - b);
	}, [pagination?.pageSizeOptions, resolvedPaginationState.pageSize]);
	const showPageSizeSelect = pagination?.showPageSizeSelect !== false;

	const preferenceColumnIds = useMemo(() => {
		const ids = new Set(dataColumnIds);
		if (enableRowSelection) {
			ids.add(selectionColumnId);
		}
		return ids;
	}, [dataColumnIds, enableRowSelection]);

	const preferencesSnapshot = useMemo(() => {
		if (!preferencesConfig) return null;
		const sanitizedVisibility = Object.fromEntries(
			Object.entries(columnVisibility).filter(([id]) =>
				preferenceColumnIds.has(id)
			)
		);
		const sanitizedOrder =
			columnOrder.length === 0
				? columnOrder
				: columnOrder.filter((id) => preferenceColumnIds.has(id));
		const sanitizedSorting = sorting.filter((item) =>
			preferenceColumnIds.has(item.id)
		);
		const sanitizedFilters = columnFilters.filter((item) =>
			preferenceColumnIds.has(item.id)
		);
		const paginationState = paginationEnabled
			? {
					pageSize: resolvedPaginationState.pageSize,
					...(preferencesConfig.persistPageIndex
						? { pageIndex: resolvedPaginationState.pageIndex }
						: {}),
			  }
			: undefined;

		return {
			sorting: sanitizedSorting,
			columnVisibility: sanitizedVisibility,
			columnFilters: sanitizedFilters,
			columnOrder: sanitizedOrder,
			pagination: paginationState,
		};
	}, [
		paginationEnabled,
		columnFilters,
		columnOrder,
		columnVisibility,
		preferenceColumnIds,
		preferencesConfig,
		resolvedPaginationState.pageIndex,
		resolvedPaginationState.pageSize,
		sorting,
	]);

	const debouncedPreferences = useDebounce(
		preferencesSnapshot,
		preferencesConfig?.debounceMs ?? 300
	);

	useEffect(() => {
		if (!preferencesConfig || !debouncedPreferences) return;
		saveDataTablePreferences(preferencesConfig, debouncedPreferences);
	}, [debouncedPreferences, preferencesConfig]);

	useEffect(() => {
		if (!enableRowSelection) {
			setRowSelection({});
		}
	}, [enableRowSelection]);

	useEffect(() => {
		if (!paginationEnabled || pagination?.state) return;
		const nextPageSize = pagination?.pageSize;
		if (typeof nextPageSize !== "number") return;
		if (typeof persistedPageSize === "number") return;
		setInternalPaginationState((prev) =>
			prev.pageSize === nextPageSize
				? prev
				: { ...prev, pageIndex: 0, pageSize: nextPageSize }
		);
	}, [pagination?.pageSize, pagination?.state, paginationEnabled, persistedPageSize]);

	useEffect(() => {
		if (!enableRowSelection) return;
		if (onSelectionChange) {
			onSelectionChange(selectedRowData);
		}
	}, [enableRowSelection, onSelectionChange, selectedRowData]);

	useEffect(() => {
		if (!enableRowSelection) return;
		table.resetRowSelection();
	}, [enableRowSelection, selectionResetKey, table]);

	const toolbarContent = showSelectionToolbar
		? renderToolbarActions
			? renderToolbarActions(selectedRowData)
			: toolbarActions
		: null;

	const exportRows = useCallback(
		(rows: Row<T>[]) => {
			exportRowsToCsv(rows, {
				enableExport,
				exportFileName,
				visibleColumns: visibleDataColumns,
				columnConfigById,
			});
		},
		[enableExport, exportFileName, visibleDataColumns, columnConfigById]
	);

	const exportSelectedRows = useCallback(
		() => exportRows(selectedRows),
		[exportRows, selectedRows]
	);
	const exportAllRows = useCallback(
		() => exportRows(table.getSortedRowModel().rows),
		[exportRows, table]
	);

	if (isLoading) {
		return (
			<DataTableSkeleton
				columnCount={table.getVisibleLeafColumns().length}
				rowCount={Math.min(resolvedPaginationState.pageSize, 8)}
				showTopBar={Boolean(enableExport || search || topBarActions)}
				showPagination={paginationEnabled}
				className={className}
			/>
		);
	}

	return (
		<div
			className={cn(
				"flex min-h-0 flex-col rounded-xl border border-border/60 bg-card shadow-sm",
				className
			)}
		>
			<DataTableTopBar
				enableExport={enableExport}
				onExportAll={exportAllRows}
				search={search}
				leftActions={topBarActions}
			/>
			<Table
				className="text-[13px]"
				containerClassName="flex-1 min-h-0 overflow-auto scrollbar-hidden"
			>
				<DataTableHeader
					table={table}
					columns={columns}
					columnConfigById={columnConfigById}
					visibleDataColumnCount={visibleDataColumnCount}
					columnVisibility={columnVisibility}
					rowSelection={rowSelection}
					selectionState={selectionState}
					appliedFilters={appliedFilters}
					getDraftFilter={getDraftFilter}
					onFilterOperatorChange={handleFilterOperatorChange}
					onFilterValueChange={handleFilterValueChange}
					onApplyFilter={applyFilter}
					onClearFilter={clearFilter}
					openMenuColumnId={openMenuColumnId}
					onOpenMenuChange={handleOpenMenuChange}
					enableColumnReorder={enableColumnReorder}
				/>
				<DataTableBody
					table={table}
					rows={displayRows}
					columnConfigById={columnConfigById}
					emptyMessage={emptyMessage}
					rowSelection={rowSelection}
					columnVisibility={columnVisibility}
					onRowClick={onRowClick}
				/>
			</Table>
			{paginationEnabled ? (
				<DataTablePagination
					table={table}
					paginationState={paginationDisplayState}
					totalRows={totalRows}
					totalPages={totalPages}
					pageSizeOptions={pageSizeOptions}
					showPageSizeSelect={showPageSizeSelect}
				/>
			) : null}
			{showSelectionToolbar ? (
				<DataTableSelectionToolbar
					selectionCount={selectionCount}
					enableExport={enableExport}
					onClearSelection={() => table.resetRowSelection()}
					onExportSelected={exportSelectedRows}
					toolbarContent={toolbarContent}
				/>
			) : null}
		</div>
	);
}

function DataTableSkeleton({
	columnCount,
	rowCount,
	showTopBar,
	showPagination,
	className,
}: DataTableSkeletonProps) {
	const columns = Math.max(1, columnCount);
	const rows = Math.max(3, rowCount);
	const headerWidths = ["w-16", "w-24", "w-32", "w-20", "w-28"];

	return (
		<div
			className={cn(
				"flex min-h-0 flex-col rounded-md border border-border/70",
				className
			)}
		>
			{showTopBar ? (
				<div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
					<Skeleton className="h-8 w-28" />
					<Skeleton className="h-8 w-48" />
					<div className="ml-auto flex items-center gap-2">
						<Skeleton className="h-8 w-24" />
					</div>
				</div>
			) : null}
			<Table
				className="text-[13px]"
				containerClassName="flex-1 min-h-0 overflow-auto scrollbar-hidden"
			>
				<TableHeader>
					<TableRow>
						{Array.from({ length: columns }).map((_, index) => (
							<TableHead key={`header-skeleton-${index}`}>
								<Skeleton className={`h-3 ${headerWidths[index % headerWidths.length]}`} />
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{Array.from({ length: rows }).map((_, rowIndex) => (
						<TableRow key={`row-skeleton-${rowIndex}`}>
							{Array.from({ length: columns }).map((__, columnIndex) => (
								<TableCell key={`cell-skeleton-${rowIndex}-${columnIndex}`}>
									<Skeleton
										className={`h-3 ${headerWidths[(rowIndex + columnIndex) % headerWidths.length]}`}
									/>
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
			{showPagination ? (
				<div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
					<Skeleton className="h-3 w-48" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-20" />
						<Skeleton className="h-8 w-20" />
					</div>
				</div>
			) : null}
		</div>
	);
}
