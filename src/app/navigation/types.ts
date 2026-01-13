import type { LucideIcon } from "lucide-react";
import type { PermissionCode } from "@/app/permissions/types";

export type AreaId =
	| "workspace"
	| "workflows"
	| "loans"
	| "stock"
	| "people"
	| "documents"
	| "announcements"
	| "settings"
	| "admin";

export interface AppArea {
	id: AreaId;
	label: string;
	icon: LucideIcon;
	path: string;
	description?: string;
}

export interface NavItem {
	id: string;
	label: string;
	path: string;
	icon: LucideIcon;
	permissions?: PermissionCode | PermissionCode[];
}

export type NavConfig = Record<AreaId, NavItem[]>;
