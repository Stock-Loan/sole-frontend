export type AclEffect = "allow" | "deny";

export interface AclAssignment {
	id: string;
	org_id: string;
	user_id: string;
	full_name?: string | null;
	email?: string | null;
	permissions: string[];
	effect: AclEffect;
	expires_at?: string | null;
	created_at?: string;
	updated_at?: string;
}

export interface AclAssignmentsResponse {
	items: AclAssignment[];
}

export interface AclAssignmentCreatePayload {
	user_id: string;
	permissions: string[];
	effect: AclEffect;
	expires_at?: string | null;
}

export interface AclAssignmentUpdatePayload {
	permissions?: string[];
	effect?: AclEffect;
	expires_at?: string | null;
}

export interface AclAssignmentFormValues {
	user_id: string;
	permissions: string[];
	effect: AclEffect;
	expires_at?: string | null;
}

export interface AclPermissionsPickerProps {
	value: string[];
	onChange: (next: string[]) => void;
	disabled?: boolean;
}

export interface AclPermissionTagsProps {
	permissions: string[];
	maxVisible?: number;
}
