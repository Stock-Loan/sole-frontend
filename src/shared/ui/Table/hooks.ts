import { useCallback, useMemo, useState } from "react";
import type { ColumnFiltersState, Table } from "@tanstack/react-table";
import { isFilterActive } from "./constants";
import { getAppliedFilters, getDraftFilterValue } from "./utils";
import type { ColumnFilterState, FilterOperator } from "./types";

export function useDataTableFilterState<T>(
	table: Table<T>,
	columnFilters: ColumnFiltersState
) {
	const [filterDrafts, setFilterDrafts] = useState<
		Record<string, ColumnFilterState>
	>({});
	const [openMenuColumnId, setOpenMenuColumnId] = useState<string | null>(null);

	const appliedFilters = useMemo(
		() => getAppliedFilters(columnFilters),
		[columnFilters]
	);

	const getDraftFilter = useCallback(
		(columnId: string) =>
			getDraftFilterValue(columnId, filterDrafts, appliedFilters),
		[appliedFilters, filterDrafts]
	);

	const handleFilterOperatorChange = useCallback(
		(columnId: string, operator: FilterOperator) => {
			const current = getDraftFilter(columnId);
			setFilterDrafts((prev) => ({
				...prev,
				[columnId]: { ...current, operator },
			}));
		},
		[getDraftFilter]
	);

	const handleFilterValueChange = useCallback(
		(columnId: string, value: string) => {
			const current = getDraftFilter(columnId);
			setFilterDrafts((prev) => ({
				...prev,
				[columnId]: { ...current, value },
			}));
		},
		[getDraftFilter]
	);

	const applyFilter = useCallback(
		(columnId: string) => {
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
		},
		[getDraftFilter, table]
	);

	const clearFilter = useCallback(
		(columnId: string) => {
			const column = table.getColumn(columnId);
			if (!column) return;
			column.setFilterValue(undefined);
			setFilterDrafts((prev) => {
				const next = { ...prev };
				delete next[columnId];
				return next;
			});
			setOpenMenuColumnId(null);
		},
		[table]
	);

	const handleOpenMenuChange = useCallback(
		(columnId: string, open: boolean) => {
			setOpenMenuColumnId(open ? columnId : null);
		},
		[]
	);

	return {
		appliedFilters,
		getDraftFilter,
		handleFilterOperatorChange,
		handleFilterValueChange,
		applyFilter,
		clearFilter,
		openMenuColumnId,
		handleOpenMenuChange,
	};
}
