import { PERMISSION_CATALOG } from "@/app/permissions/permissionCodes";

export const ROLE_TYPE_LABELS = {
	system: "System role",
	custom: "Custom role",
} as const;

export const ROLE_TYPE_STYLES = {
	system: "bg-amber-100 text-amber-800 border-amber-200",
	custom: "bg-emerald-100 text-emerald-800 border-emerald-200",
} as const;

export const ROLE_FORM_TITLE: Record<"create" | "edit", string> = {
	create: "Create role",
	edit: "Edit role",
};

export const ROLE_FORM_DESCRIPTION: Record<"create" | "edit", string> = {
	create: "Define a custom role and select permissions.",
	edit: "Update role details and permissions.",
};

// Optional grouping scaffold for future pickers; adjust as UI needs evolve.
export { PERMISSION_CATALOG };
