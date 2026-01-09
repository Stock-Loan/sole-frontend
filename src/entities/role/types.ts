import type { PermissionCatalog, PermissionCode } from "@/app/permissions/permissionCodes";

export interface Role {
	id: string;
	org_id?: string;
	name: string;
	description?: string | null;
	is_system_role?: boolean;
	permissions: PermissionCode[];
	created_at?: string;
	updated_at?: string;
}

export interface RoleListResponse {
	items: Role[];
	total?: number;
	page?: number;
	page_size?: number;
}

export interface RoleListParams {
	page?: number;
	page_size?: number;
}

export interface RoleInput {
	name: string;
	description?: string | null;
	permissions: PermissionCode[];
}

export interface RoleAssignmentPayload {
	role_id: string;
}

export interface UserRoleAssignment {
	membership_id: string;
	role_id: string;
}

export type { PermissionCatalog, PermissionCode };

export interface RolesTableProps {
	roles: Role[];
	isLoading: boolean;
	isError: boolean;
	isFetching?: boolean;
	onRetry: () => void;
	onViewPermissions: (role: Role) => void;
	onEdit?: (role: Role) => void;
}

export interface RolePermissionsDialogProps {
	role: Role | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export type RoleFilterType = "ALL" | "SYSTEM" | "CUSTOM";

export interface RolesFiltersProps {
	search: string;
	onSearchChange: (value: string) => void;
	type: RoleFilterType;
	onTypeChange: (type: RoleFilterType) => void;
}

export type RoleFormMode = "create" | "edit";

export interface RoleFormValues {
	name: string;
	description?: string | null;
	permissions: PermissionCode[];
}

export interface RoleFormDialogProps {
	mode: RoleFormMode;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	initialRole?: Role | null;
	onSubmit: (values: RoleFormValues, roleId?: string) => Promise<void>;
	isSubmitting?: boolean;
}
export interface RoleFormProps {
	initialValues?: RoleFormValues;
	onSubmit: (values: RoleFormValues) => Promise<void>;
	isSubmitting?: boolean;
	disabled?: boolean;
	formId?: string;
}
export interface UserRoleAssignmentsProps {
	membershipId: string;
	assignedRoleIds?: string[] | null;
	platformStatus?: string | null;
	onUpdated?: () => void;
	disableAssignments?: boolean;
	disableReason?: string;
}
