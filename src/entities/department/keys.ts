import type { DepartmentListParams } from "./types";

export const departmentKeys = {
	list: (params?: DepartmentListParams) =>
		["departments", "list", params ?? {}] as const,
	detail: (departmentId: string) =>
		["departments", "detail", departmentId] as const,
};
