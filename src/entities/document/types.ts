export interface DocumentSummary {
	id: string;
	name: string;
	createdAt?: string;
}

export interface OrgDocumentFolder {
	id: string;
	org_id: string;
	name: string;
	system_key?: string | null;
	is_system: boolean;
	template_count: number;
	created_at?: string;
}

export interface OrgDocumentFolderListResponse {
	items: OrgDocumentFolder[];
	total?: number;
}

export interface OrgDocumentFolderCreatePayload {
	name: string;
}

export interface OrgDocumentFolderUpdatePayload {
	name: string;
}

export interface OrgDocumentTemplate {
	id: string;
	org_id: string;
	folder_id?: string | null;
	name: string;
	description?: string | null;
	file_name: string;
	storage_path_or_url?: string | null;
	uploaded_by_user_id?: string | null;
	created_at?: string;
}

export interface OrgDocumentTemplateListResponse {
	items: OrgDocumentTemplate[];
	total?: number;
}

export interface OrgDocumentTemplateListParams {
	folder_id?: string | null;
}

export interface OrgDocumentTemplateUploadPayload {
	file: File;
	folder_id?: string | null;
	name?: string | null;
	description?: string | null;
}
