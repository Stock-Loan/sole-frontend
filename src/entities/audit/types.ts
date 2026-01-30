export interface AuditLog {
	id: string;
	org_id?: string;
	actor_id?: string | null;
	actor?: {
		user_id: string;
		full_name: string;
		email: string;
	} | null;
	action: string;
	resource_type?: string | null;
	resource_id?: string | null;
	summary?: string | null;
	changes?: Record<string, { from?: unknown; to?: unknown }> | null;
	old_value?: unknown;
	new_value?: unknown;
	created_at: string;
}

export interface AuditLogListResponse {
	items: AuditLog[];
	total: number;
}

export interface AuditLogListParams {
	page?: number;
	page_size?: number;
	feature?: string[];
	action?: string[];
	resource_type?: string;
	resource_id?: string;
	actor_id?: string;
	created_from?: string;
	created_to?: string;
}
