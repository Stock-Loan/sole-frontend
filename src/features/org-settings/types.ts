export interface OrgSettings {
	org_id: string;
	allow_user_data_export: boolean;
	allow_profile_edit: boolean;
	require_two_factor: boolean;
	audit_log_retention_days: number;
	inactive_user_retention_days: number;
	enforce_service_duration_rule: boolean;
	min_service_duration_days: number | null;
	enforce_min_vested_to_exercise: boolean;
	min_vested_shares_to_exercise: number | null;
	created_at?: string;
	updated_at?: string;
}

export interface OrgSettingsUpdatePayload {
	allow_user_data_export?: boolean;
	allow_profile_edit?: boolean;
	require_two_factor?: boolean;
	audit_log_retention_days?: number;
	inactive_user_retention_days?: number;
	enforce_service_duration_rule?: boolean;
	min_service_duration_days?: number | null;
	enforce_min_vested_to_exercise?: boolean;
	min_vested_shares_to_exercise?: number | null;
}

export interface OrgSettingsFormValues {
	allow_user_data_export: boolean;
	allow_profile_edit: boolean;
	require_two_factor: boolean;
	audit_log_retention_days: number;
	inactive_user_retention_days: number;
	enforce_service_duration_rule: boolean;
	min_service_duration_days: number | null;
	enforce_min_vested_to_exercise: boolean;
	min_vested_shares_to_exercise: number | null;
}
