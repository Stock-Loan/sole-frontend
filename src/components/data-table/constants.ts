import type { Row } from "@tanstack/react-table";
import type {
	ColumnDefinition,
	ColumnFilterState,
	DataTablePreferencesConfig,
	DataTablePreferencesPayload,
	DataTablePreferencesState,
	FilterOperator,
	FilterOperatorOption,
	SortValue,
} from "./types";

export const selectionColumnId = "__select";
export const defaultPageSize = 10;
export const defaultPageSizeOptions = [10, 20, 50];
export const dataTablePreferencesVersion = 1;
export const dataTablePreferencesPrefix = "sole.dataTable.preferences";

export const filterOperatorOptions: FilterOperatorOption[] = [
	{ value: "equals", label: "Is equal to", requiresValue: true },
	{ value: "not_equals", label: "Is not equal to", requiresValue: true },
	{ value: "greater_than", label: "Greater than", requiresValue: true },
	{
		value: "greater_than_or_equal",
		label: "Greater than or equal to",
		requiresValue: true,
	},
	{ value: "less_than", label: "Less than", requiresValue: true },
	{
		value: "less_than_or_equal",
		label: "Less than or equal to",
		requiresValue: true,
	},
	{ value: "starts_with", label: "Starts with", requiresValue: true },
	{ value: "contains", label: "Contains", requiresValue: true },
	{ value: "not_contains", label: "Does not contain", requiresValue: true },
	{ value: "ends_with", label: "Ends with", requiresValue: true },
	{ value: "is_null", label: "Is null", requiresValue: false },
	{ value: "is_not_null", label: "Is not null", requiresValue: false },
	{ value: "is_empty", label: "Is empty", requiresValue: false },
	{ value: "is_not_empty", label: "Is not empty", requiresValue: false },
];

export const defaultFilterState: ColumnFilterState = {
	operator: "contains",
	value: "",
};

export function normalizeSortValue(value: unknown): SortValue {
	if (value === null || value === undefined) return "";
	if (value instanceof Date) return value.getTime();
	if (typeof value === "number") return value;
	if (typeof value === "boolean") return value ? 1 : 0;
	if (typeof value === "string") return value.toLowerCase();
	return String(value).toLowerCase();
}

export function compareValues(a: SortValue, b: SortValue): number {
	if (typeof a === "number" && typeof b === "number") {
		return a - b;
	}
	return String(a).localeCompare(String(b));
}

export function normalizeFilterValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (value instanceof Date) return value.toISOString().toLowerCase();
	if (typeof value === "string") return value.toLowerCase();
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value).toLowerCase();
	}
	return String(value).toLowerCase();
}

export function isNullish(value: unknown) {
	return value === null || value === undefined;
}

export function isEmptyValue(value: unknown) {
	if (typeof value === "string") return value.length === 0;
	if (Array.isArray(value)) return value.length === 0;
	return false;
}

export function isFilterActive(filter: ColumnFilterState) {
	const option = filterOperatorOptions.find(
		(item) => item.value === filter.operator
	);
	if (!option) return false;
	if (!option.requiresValue) return true;
	return filter.value.trim().length > 0;
}

function parseNumberValue(value: unknown): number | null {
	if (typeof value === "number") {
		return Number.isFinite(value) ? value : null;
	}
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	const cleaned = trimmed.replace(/[^0-9.-]/g, "");
	if (!cleaned || cleaned === "-" || cleaned === "." || cleaned === "-.") {
		return null;
	}
	const parsed = Number(cleaned);
	return Number.isFinite(parsed) ? parsed : null;
}

export function applyFilterOperator(
	operator: FilterOperator,
	cellValue: unknown,
	filterValue: string
): boolean {
	if (operator === "is_null") return isNullish(cellValue);
	if (operator === "is_not_null") return !isNullish(cellValue);
	if (operator === "is_empty") return isEmptyValue(cellValue);
	if (operator === "is_not_empty") {
		return !isNullish(cellValue) && !isEmptyValue(cellValue);
	}

	if (isNullish(cellValue)) return false;

	const numericCell = parseNumberValue(cellValue);
	const numericFilter = parseNumberValue(filterValue);
	const hasNumericValues =
		numericCell !== null && numericFilter !== null && Number.isFinite(numericCell);

	const normalizedCell = normalizeFilterValue(cellValue);
	const normalizedFilter = normalizeFilterValue(filterValue.trim());

	switch (operator) {
		case "equals":
			if (hasNumericValues) {
				return numericCell === numericFilter;
			}
			return normalizedCell === normalizedFilter;
		case "not_equals":
			if (hasNumericValues) {
				return numericCell !== numericFilter;
			}
			return normalizedCell !== normalizedFilter;
		case "greater_than":
			return hasNumericValues ? numericCell > numericFilter : false;
		case "greater_than_or_equal":
			return hasNumericValues ? numericCell >= numericFilter : false;
		case "less_than":
			return hasNumericValues ? numericCell < numericFilter : false;
		case "less_than_or_equal":
			return hasNumericValues ? numericCell <= numericFilter : false;
		case "starts_with":
			return normalizedCell.startsWith(normalizedFilter);
		case "contains":
			return normalizedCell.includes(normalizedFilter);
		case "not_contains":
			return !normalizedCell.includes(normalizedFilter);
		case "ends_with":
			return normalizedCell.endsWith(normalizedFilter);
		default:
			return true;
	}
}

export function stringifyCsvValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (value instanceof Date) return value.toISOString();
	if (typeof value === "string") return value;
	if (typeof value === "number" || typeof value === "boolean") {
		return String(value);
	}
	if (Array.isArray(value)) {
		return value.map((item) => stringifyCsvValue(item)).join(", ");
	}
	if (typeof value === "object") {
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}
	return String(value);
}

export function escapeCsvValue(value: string): string {
	const escaped = value.replace(/"/g, '""');
	return `"${escaped}"`;
}

export function isColumnFilterState(value: unknown): value is ColumnFilterState {
	if (!value || typeof value !== "object") return false;
	const operator = (value as ColumnFilterState).operator;
	return filterOperatorOptions.some((option) => option.value === operator);
}

export function getAccessorValueFromConfig<T>(
	row: T,
	config?: ColumnDefinition<T>,
	columnId?: string,
	tableRow?: Row<T>
): unknown {
	if (!config) return tableRow?.getValue(columnId ?? "");
	const accessor = config.accessor;
	if (typeof accessor === "function") return accessor(row);
	if (typeof accessor === "string")
		return (row as Record<string, unknown>)[accessor];
	return tableRow?.getValue(columnId ?? "");
}

export function normalizeColumnOrder(
	order: string[] | undefined,
	columnIds: string[],
	enableRowSelection: boolean
) {
	if (!order || order.length === 0) return [];
	const cleaned = order.filter(
		(id) =>
			columnIds.includes(id) ||
			(enableRowSelection && id === selectionColumnId)
	);
	const missing = columnIds.filter((id) => !cleaned.includes(id));
	const nextOrder = [...cleaned, ...missing];
	if (!enableRowSelection) {
		return nextOrder.filter((id) => id !== selectionColumnId);
	}
	const withoutSelection = nextOrder.filter((id) => id !== selectionColumnId);
	return [selectionColumnId, ...withoutSelection];
}

function resolveDataTableStorage(config?: DataTablePreferencesConfig) {
	if (typeof window === "undefined") return null;
	const storageType = config?.storage ?? "local";
	try {
		return storageType === "session"
			? window.sessionStorage
			: window.localStorage;
	} catch {
		return null;
	}
}

export function resolveDataTablePreferencesKey(
	config: DataTablePreferencesConfig
) {
	if (config.storageKey) return config.storageKey;
	const scope = config.scope ?? "user";
	const parts = [dataTablePreferencesPrefix, config.id, scope];

	if (scope === "org" || scope === "user") {
		const orgSegment = config.orgKey ?? "unknown-org";
		parts.push(`org-${orgSegment}`);
	}

	if (scope === "user") {
		const userSegment = config.userKey ?? "anonymous";
		parts.push(`user-${userSegment}`);
	}

	return parts.join(".");
}

export function loadDataTablePreferences(
	config?: DataTablePreferencesConfig
): DataTablePreferencesState | null {
	if (!config) return null;
	const storage = resolveDataTableStorage(config);
	if (!storage) return null;
	try {
		const key = resolveDataTablePreferencesKey(config);
		const raw = storage.getItem(key);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as DataTablePreferencesPayload | null;
		if (!parsed || typeof parsed !== "object") return null;
		const version = config.version ?? dataTablePreferencesVersion;
		if (parsed.version !== version) return null;
		return parsed.state ?? null;
	} catch (error) {
		console.warn("Failed to load data table preferences", error);
		return null;
	}
}

export function saveDataTablePreferences(
	config: DataTablePreferencesConfig,
	state: DataTablePreferencesState
) {
	const storage = resolveDataTableStorage(config);
	if (!storage) return;
	const key = resolveDataTablePreferencesKey(config);
	const payload: DataTablePreferencesPayload = {
		version: config.version ?? dataTablePreferencesVersion,
		state,
	};
	try {
		storage.setItem(key, JSON.stringify(payload));
	} catch (error) {
		console.warn("Failed to save data table preferences", error);
	}
}

export function clearDataTablePreferences(config?: DataTablePreferencesConfig) {
	if (!config) return;
	const storage = resolveDataTableStorage(config);
	if (!storage) return;
	try {
		const key = resolveDataTablePreferencesKey(config);
		storage.removeItem(key);
	} catch (error) {
		console.warn("Failed to clear data table preferences", error);
	}
}
