export interface OrgSettings {
	org_id: string;
	allow_user_data_export: boolean;
	allow_profile_edit: boolean;
	require_two_factor: boolean;
	audit_log_retention_days: number;
	inactive_user_retention_days: number;
	created_at?: string;
	updated_at?: string;
}

export interface OrgSettingsUpdatePayload {
	allow_user_data_export?: boolean;
	allow_profile_edit?: boolean;
	require_two_factor?: boolean;
	audit_log_retention_days?: number;
	inactive_user_retention_days?: number;
}
