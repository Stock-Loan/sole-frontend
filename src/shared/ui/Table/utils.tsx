import type {
	ColumnDef,
	ColumnFiltersState,
	FilterFn,
	Row,
	SortingFn,
} from "@tanstack/react-table";
import {
	applyFilterOperator,
	compareValues,
	defaultFilterState,
	escapeCsvValue,
	getAccessorValueFromConfig,
	isColumnFilterState,
	isFilterActive,
	normalizeSortValue,
	stringifyCsvValue,
} from "./constants";
import type {
	ColumnConfigMap,
	ColumnDefinition,
	ColumnFilterState,
	DataTableExportContext,
} from "./types";

export function getAppliedFilters(
	columnFilters: ColumnFiltersState
): Record<string, ColumnFilterState> {
	const next: Record<string, ColumnFilterState> = {};
	columnFilters.forEach((filter) => {
		if (isColumnFilterState(filter.value)) {
			next[filter.id] = filter.value;
		}
	});
	return next;
}

export function getDraftFilterValue(
	columnId: string,
	filterDrafts: Record<string, ColumnFilterState>,
	appliedFilters: Record<string, ColumnFilterState>
): ColumnFilterState {
	return (
		filterDrafts[columnId] ?? appliedFilters[columnId] ?? defaultFilterState
	);
}

export function createAdvancedTextFilterFn<T>(
	columnConfigById: ColumnConfigMap<T>
): FilterFn<T> {
	const filterFn: FilterFn<T> = (row, columnId, filterValue) => {
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
	};
	filterFn.autoRemove = (value: unknown) =>
		!isColumnFilterState(value) || !isFilterActive(value);

	return filterFn;
}

export function createAdvancedSortingFn<T>(
	columnConfigById: ColumnConfigMap<T>
): SortingFn<T> {
	return (rowA, rowB, columnId) => {
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
	};
}

export function buildDataColumns<T>(
	columns: ColumnDefinition<T>[],
	advancedSortingFn: SortingFn<T>,
	advancedTextFilterFn: FilterFn<T>
): ColumnDef<T, unknown>[] {
	return columns.map((column) => {
		const accessorKey =
			typeof column.accessor === "string"
				? (column.accessor)
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
			typeof column.header === "string" ? column.header : () => column.header;

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
	});
}

function getExportLabel<T>(
	config: ColumnDefinition<T> | undefined,
	id: string
) {
	if (config?.exportLabel) return config.exportLabel;
	if (typeof config?.header === "string") return config.header;
	return id;
}

function getExportValue<T>(
	row: Row<T>,
	columnId: string,
	config?: ColumnDefinition<T>
) {
	if (config?.exportAccessor) {
		return stringifyCsvValue(config.exportAccessor(row.original));
	}
	if (config?.accessor) {
		return stringifyCsvValue(
			getAccessorValueFromConfig(row.original, config, columnId, row)
		);
	}
	return stringifyCsvValue(row.getValue(columnId));
}

export function exportRowsToCsv<T>(
	rows: Row<T>[],
	{
		enableExport,
		exportFileName,
		visibleColumns,
		columnConfigById,
	}: DataTableExportContext<T>
) {
	if (!enableExport || rows.length === 0) return;
	const exportColumns = visibleColumns.filter((column) => {
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
}
