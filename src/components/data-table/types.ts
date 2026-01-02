import type { Column, PaginationState, Table } from "@tanstack/react-table";
import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";
export type SortValue = number | string;

export type FilterOperator =
	| "equals"
	| "not_equals"
	| "starts_with"
	| "contains"
	| "not_contains"
	| "ends_with"
	| "is_null"
	| "is_not_null"
	| "is_empty"
	| "is_not_empty";

export interface SortState {
	id: string;
	direction: SortDirection;
}

export interface FilterOperatorOption {
	value: FilterOperator;
	label: string;
	requiresValue: boolean;
}

export interface ColumnFilterState {
	operator: FilterOperator;
	value: string;
}

export interface ColumnDefinition<T> {
	id: string;
	header: ReactNode;
	accessor?: keyof T | ((row: T) => unknown);
	cell?: (row: T) => ReactNode;
	sortAccessor?: (row: T) => unknown;
	filterAccessor?: (row: T) => unknown;
	exportAccessor?: (row: T) => unknown;
	exportLabel?: string;
	enableSorting?: boolean;
	enableFiltering?: boolean;
	enableHiding?: boolean;
	enableExport?: boolean;
	headerClassName?: string;
	cellClassName?: string;
}

export type ColumnConfigMap<T> = Map<string, ColumnDefinition<T>>;

export interface DataTablePaginationConfig {
	enabled?: boolean;
	pageSize?: number;
	pageSizeOptions?: number[];
	showPageSizeSelect?: boolean;
}

export interface DataTableProps<T> {
	data: T[];
	columns: ColumnDefinition<T>[];
	getRowId?: (row: T, index: number) => string;
	isLoading?: boolean;
	emptyMessage?: string;
	className?: string;
	enableRowSelection?: boolean;
	enableExport?: boolean;
	exportFileName?: string;
	onSelectionChange?: (selectedRows: T[]) => void;
	toolbarActions?: ReactNode;
	renderToolbarActions?: (selectedRows: T[]) => ReactNode;
	pagination?: DataTablePaginationConfig;
}

export interface DataTableExportContext<T> {
	enableExport: boolean;
	exportFileName: string;
	visibleColumns: Column<T, unknown>[];
	columnConfigById: ColumnConfigMap<T>;
}

export interface DataTableHeaderProps<T> {
	table: Table<T>;
	columns: ColumnDefinition<T>[];
	columnConfigById: ColumnConfigMap<T>;
	visibleDataColumnCount: number;
	appliedFilters: Record<string, ColumnFilterState>;
	getDraftFilter: (columnId: string) => ColumnFilterState;
	onFilterOperatorChange: (columnId: string, operator: FilterOperator) => void;
	onFilterValueChange: (columnId: string, value: string) => void;
	onApplyFilter: (columnId: string) => void;
	onClearFilter: (columnId: string) => void;
	openMenuColumnId: string | null;
	onOpenMenuChange: (columnId: string, open: boolean) => void;
}

export interface DataTableColumnMenuProps<T> {
	table: Table<T>;
	column: Column<T, unknown>;
	columns: ColumnDefinition<T>[];
	visibleDataColumnCount: number;
	draft: ColumnFilterState;
	isFilterApplied: boolean;
	onFilterOperatorChange: (columnId: string, operator: FilterOperator) => void;
	onFilterValueChange: (columnId: string, value: string) => void;
	onApplyFilter: (columnId: string) => void;
	onClearFilter: (columnId: string) => void;
	openMenuColumnId: string | null;
	onOpenMenuChange: (columnId: string, open: boolean) => void;
}

export interface DataTableBodyProps<T> {
	table: Table<T>;
	columnConfigById: ColumnConfigMap<T>;
	emptyMessage: string;
}

export interface DataTablePaginationProps<T> {
	table: Table<T>;
	paginationState: PaginationState;
	totalRows: number;
	totalPages: number;
	pageSizeOptions: number[];
	showPageSizeSelect: boolean;
}

export interface DataTableTopBarProps {
	enableExport: boolean;
	onExportAll: () => void;
}

export interface DataTableSelectionToolbarProps {
	selectionCount: number;
	enableExport: boolean;
	onClearSelection: () => void;
	onExportSelected: () => void;
	toolbarContent?: ReactNode;
}
