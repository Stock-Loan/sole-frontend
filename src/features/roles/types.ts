export type PermissionCode =
	| "user.view"
	| "user.manage"
	| "roles.view"
	| "roles.manage"
	| "departments.view"
	| "departments.manage"
	| "announcements.view"
	| "announcements.manage"
	| "org_settings.view"
	| "org_settings.manage"
	| string;

export interface RoleBucket {
	id: string;
	orgId: string;
	name: string;
	description?: string | null;
	isSystemRole?: boolean;
	permissions: PermissionCode[];
}

export interface RoleBucketInput {
	name: string;
	description?: string | null;
	permissions: PermissionCode[];
}

export interface UserRoleAssignment {
	membershipId: string;
	roleId: string;
}

export interface PermissionCatalog {
	category: string;
	codes: PermissionCode[];
}
