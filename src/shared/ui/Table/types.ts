import type {
	Column,
	ColumnFiltersState,
	ColumnOrderState,
	PaginationState,
	Row,
	RowSelectionState,
	SortingState,
	Table,
	VisibilityState,
} from "@tanstack/react-table";
import type { ReactNode } from "react";
import type { ButtonProps } from "@/shared/ui/Button.types";

export type SortDirection = "asc" | "desc";
export type SortValue = number | string;

export type FilterOperator =
	| "equals"
	| "not_equals"
	| "greater_than"
	| "greater_than_or_equal"
	| "less_than"
	| "less_than_or_equal"
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

export interface SelectionHeaderState {
	allSelected: boolean;
	someSelected: boolean;
}

export interface DataTablePaginationConfig {
	enabled?: boolean;
	pageSize?: number;
	pageSizeOptions?: number[];
	showPageSizeSelect?: boolean;
	mode?: "client" | "server";
	state?: PaginationState;
	onPaginationChange?: (state: PaginationState) => void;
	pageCount?: number;
	totalRows?: number;
}

export interface DataTableSearchConfig {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
}

export interface DataTableHeaderAction {
	label: string;
	onClick: () => void;
	icon?: React.ComponentType<{ className?: string }>;
	variant?: ButtonProps["variant"];
	size?: ButtonProps["size"];
	disabled?: boolean;
	title?: string;
}

export interface DataTableHeaderActions {
	primaryAction?: DataTableHeaderAction;
	secondaryActions?: DataTableHeaderAction[];
}

export interface DataTablePreferencesPagination {
	pageSize?: number;
	pageIndex?: number;
}

export interface DataTablePreferencesState {
	sorting?: SortingState;
	columnVisibility?: VisibilityState;
	columnFilters?: ColumnFiltersState;
	columnOrder?: ColumnOrderState;
	pagination?: DataTablePreferencesPagination;
}

export interface DataTablePreferencesPayload {
	version: number;
	state: DataTablePreferencesState;
}

export interface DataTablePreferencesConfig {
	id: string;
	storageKey?: string;
	storage?: "local" | "session";
	scope?: "global" | "org" | "user";
	userKey?: string | null;
	orgKey?: string | null;
	persistPageIndex?: boolean;
	version?: number;
	debounceMs?: number;
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
	onRowClick?: (row: T) => void;
	toolbarActions?: ReactNode;
	renderToolbarActions?: (selectedRows: T[]) => ReactNode;
	headerActions?: DataTableHeaderActions;
	headerFilters?: ReactNode;
	selectionResetKey?: number | string;
	pagination?: DataTablePaginationConfig;
	search?: DataTableSearchConfig;
	preferences?: DataTablePreferencesConfig;
	enableColumnReorder?: boolean;
	initialColumnVisibility?: VisibilityState;
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
	columnVisibility: VisibilityState;
	rowSelection: RowSelectionState;
	selectionState: SelectionHeaderState;
	appliedFilters: Record<string, ColumnFilterState>;
	getDraftFilter: (columnId: string) => ColumnFilterState;
	onFilterOperatorChange: (columnId: string, operator: FilterOperator) => void;
	onFilterValueChange: (columnId: string, value: string) => void;
	onApplyFilter: (columnId: string) => void;
	onClearFilter: (columnId: string) => void;
	openMenuColumnId: string | null;
	onOpenMenuChange: (columnId: string, open: boolean) => void;
	enableColumnReorder: boolean;
}

export interface DataTableColumnMenuProps<T> {
	table: Table<T>;
	column: Column<T, unknown>;
	columns: ColumnDefinition<T>[];
	visibleDataColumnCount: number;
	columnVisibility: VisibilityState;
	draft: ColumnFilterState;
	isFilterApplied: boolean;
	onFilterOperatorChange: (columnId: string, operator: FilterOperator) => void;
	onFilterValueChange: (columnId: string, value: string) => void;
	onApplyFilter: (columnId: string) => void;
	onClearFilter: (columnId: string) => void;
	openMenuColumnId: string | null;
	onOpenMenuChange: (columnId: string, open: boolean) => void;
	enableColumnReorder: boolean;
}

export interface DataTableBodyProps<T> {
	table: Table<T>;
	rows: Row<T>[];
	columnConfigById: ColumnConfigMap<T>;
	emptyMessage: string;
	rowSelection: RowSelectionState;
	columnVisibility: VisibilityState;
	onRowClick?: (row: T) => void;
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
	search?: DataTableSearchConfig;
	headerActions?: DataTableHeaderActions;
	headerFilters?: ReactNode;
}

export interface DataTableSelectionToolbarProps {
	selectionCount: number;
	enableExport: boolean;
	onClearSelection: () => void;
	onExportSelected: () => void;
	toolbarContent?: ReactNode;
}

export interface DataTableSkeletonProps {
	columnCount: number;
	rowCount: number;
	showTopBar: boolean;
	showPagination: boolean;
	className?: string;
}
