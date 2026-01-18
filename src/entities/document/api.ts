import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	OrgDocumentFolder,
	OrgDocumentFolderCreatePayload,
	OrgDocumentFolderListResponse,
	OrgDocumentFolderUpdatePayload,
	OrgDocumentTemplate,
	OrgDocumentTemplateListParams,
	OrgDocumentTemplateListResponse,
	OrgDocumentTemplateUploadPayload,
} from "@/entities/document/types";

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

export async function uploadOrgDocumentTemplate(
	payload: OrgDocumentTemplateUploadPayload
): Promise<OrgDocumentTemplate> {
	const formData = new FormData();
	formData.append("file", payload.file);
	if (payload.folder_id) {
		formData.append("folder_id", payload.folder_id);
	}
	if (payload.name) {
		formData.append("name", payload.name);
	}
	if (payload.description) {
		formData.append("description", payload.description);
	}
	const { data } = await apiClient.post<OrgDocumentTemplate>(
		"/org/documents/templates/upload",
		formData,
		{
			headers: { "Content-Type": "multipart/form-data" },
		}
	);
	return unwrapApiResponse<OrgDocumentTemplate>(data);
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
