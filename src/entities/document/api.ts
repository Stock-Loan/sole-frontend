import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	OrgDocumentFolder,
	OrgDocumentFolderCreatePayload,
	OrgDocumentFolderListResponse,
	OrgDocumentFolderUpdatePayload,
	OrgDocumentTemplate,
	OrgDocumentTemplateCreatePayload,
	OrgDocumentTemplateListParams,
	OrgDocumentTemplateListResponse,
	OrgDocumentTemplateUploadUrlPayload,
	OrgDocumentTemplateUploadPayload,
} from "@/entities/document/types";
import { uploadFileToSignedUrl } from "@/shared/api/upload";

export async function listOrgDocumentFolders(): Promise<OrgDocumentFolderListResponse> {
	const { data } = await apiClient.get<OrgDocumentFolderListResponse>(
		"/org/documents/folders"
	);
	return unwrapApiResponse<OrgDocumentFolderListResponse>(data);
}

export async function createOrgDocumentFolder(
	payload: OrgDocumentFolderCreatePayload
): Promise<OrgDocumentFolder> {
	const { data } = await apiClient.post<OrgDocumentFolder>(
		"/org/documents/folders",
		payload
	);
	return unwrapApiResponse<OrgDocumentFolder>(data);
}

export async function updateOrgDocumentFolder(
	folderId: string,
	payload: OrgDocumentFolderUpdatePayload
): Promise<OrgDocumentFolder> {
	const { data } = await apiClient.patch<OrgDocumentFolder>(
		`/org/documents/folders/${folderId}`,
		payload
	);
	return unwrapApiResponse<OrgDocumentFolder>(data);
}

export async function deleteOrgDocumentFolder(folderId: string): Promise<void> {
	await apiClient.delete(`/org/documents/folders/${folderId}`);
}

export async function listOrgDocumentTemplates(
	params: OrgDocumentTemplateListParams = {}
): Promise<OrgDocumentTemplateListResponse> {
	const { data } = await apiClient.get<OrgDocumentTemplateListResponse>(
		"/org/documents/templates",
		{ params }
	);
	return unwrapApiResponse<OrgDocumentTemplateListResponse>(data);
}

export async function requestOrgDocumentTemplateUploadUrl(
	payload: OrgDocumentTemplateUploadUrlPayload
): Promise<{
	upload_url: string;
	required_headers_or_fields?: Record<string, string>;
	storage_provider: string;
	storage_bucket: string;
	storage_key: string;
	file_name?: string | null;
}> {
	const { data } = await apiClient.post(
		"/org/documents/templates/upload-url",
		payload
	);
	return unwrapApiResponse(data);
}

export async function createOrgDocumentTemplate(
	payload: OrgDocumentTemplateCreatePayload
): Promise<OrgDocumentTemplate> {
	const { data } = await apiClient.post<OrgDocumentTemplate>(
		"/org/documents/templates",
		payload
	);
	return unwrapApiResponse<OrgDocumentTemplate>(data);
}

export async function uploadOrgDocumentTemplate(
	payload: OrgDocumentTemplateUploadPayload
): Promise<OrgDocumentTemplate> {
	const fileName = payload.file.name;
	const contentType = payload.file.type || "application/octet-stream";
	const sizeBytes = payload.file.size;
	const uploadUrl = await requestOrgDocumentTemplateUploadUrl({
		folder_id: payload.folder_id ?? undefined,
		file_name: fileName,
		content_type: contentType,
		size_bytes: sizeBytes,
	});
	await uploadFileToSignedUrl({
		uploadUrl: uploadUrl.upload_url,
		file: payload.file,
		contentType,
		requiredHeaders: uploadUrl.required_headers_or_fields,
	});
	return createOrgDocumentTemplate({
		folder_id: payload.folder_id ?? undefined,
		name: payload.name ?? undefined,
		description: payload.description ?? undefined,
		file_name: uploadUrl.file_name ?? fileName,
		storage_key: uploadUrl.storage_key,
		storage_provider: uploadUrl.storage_provider,
		storage_bucket: uploadUrl.storage_bucket,
		content_type: contentType,
		size_bytes: sizeBytes,
	});
}

export async function getOrgDocumentTemplate(
	templateId: string
): Promise<OrgDocumentTemplate> {
	const { data } = await apiClient.get<OrgDocumentTemplate>(
		`/org/documents/templates/${templateId}`
	);
	return unwrapApiResponse<OrgDocumentTemplate>(data);
}

export async function downloadOrgDocumentTemplate(
	templateId: string
): Promise<Blob> {
	const { data } = await apiClient.get(
		`/org/documents/templates/${templateId}/download`,
		{ responseType: "blob" }
	);
	return data as Blob;
}

export async function deleteOrgDocumentTemplate(templateId: string): Promise<void> {
	await apiClient.delete(`/org/documents/templates/${templateId}`);
}
