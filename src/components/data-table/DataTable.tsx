import { useCallback, useEffect, useMemo, useState } from "react";
import {
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
	type ColumnDef,
	type ColumnFiltersState,
	type PaginationState,
	type Row,
	type RowSelectionState,
	type SortingState,
	type VisibilityState,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Table } from "@/components/ui/table";
import { LoadingState } from "@/components/common/LoadingState";
import { cn } from "@/lib/utils";
import { DataTableBody } from "./DataTableBody";
import { DataTableHeader } from "./DataTableHeader";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableSelectionToolbar } from "./DataTableSelectionToolbar";
import { DataTableTopBar } from "./DataTableTopBar";
import { useDataTableFilterState } from "./hooks";
import type { ColumnConfigMap, DataTableProps } from "./types";
import {
	defaultPageSize,
	defaultPageSizeOptions,
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
	toolbarActions,
	renderToolbarActions,
	pagination,
}: DataTableProps<T>) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const paginationEnabled = pagination?.enabled ?? true;
	const initialPageSize = pagination?.pageSize ?? defaultPageSize;
	const [paginationState, setPaginationState] = useState<PaginationState>(
		() => ({
			pageIndex: 0,
			pageSize: initialPageSize,
		})
	);

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
	const totalPages = paginationEnabled ? Math.max(1, table.getPageCount()) : 1;
	const showSelectionToolbar = enableRowSelection && selectionCount > 0;
	const pageSizeOptions = useMemo(() => {
		const options = pagination?.pageSizeOptions ?? defaultPageSizeOptions;
		return Array.from(new Set([...options, paginationState.pageSize])).sort(
			(a, b) => a - b
		);
	}, [pagination?.pageSizeOptions, paginationState.pageSize]);
	const showPageSizeSelect = pagination?.showPageSizeSelect !== false;

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
		return <LoadingState />;
	}

	return (
		<div className={cn("rounded-md border border-border/70", className)}>
			<DataTableTopBar
				enableExport={enableExport}
				onExportAll={exportAllRows}
			/>
			<Table>
				<DataTableHeader
					table={table}
					columns={columns}
					columnConfigById={columnConfigById}
					visibleDataColumnCount={visibleDataColumnCount}
					appliedFilters={appliedFilters}
					getDraftFilter={getDraftFilter}
					onFilterOperatorChange={handleFilterOperatorChange}
					onFilterValueChange={handleFilterValueChange}
					onApplyFilter={applyFilter}
					onClearFilter={clearFilter}
					openMenuColumnId={openMenuColumnId}
					onOpenMenuChange={handleOpenMenuChange}
				/>
				<DataTableBody
					table={table}
					columnConfigById={columnConfigById}
					emptyMessage={emptyMessage}
				/>
			</Table>
			{paginationEnabled ? (
				<DataTablePagination
					table={table}
					paginationState={paginationState}
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
