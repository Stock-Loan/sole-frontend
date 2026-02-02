import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import { uploadFileToSignedUrl } from "@/shared/api/upload";
import type {
	FinanceLoanDetailResponse,
	HrLoanDetailResponse,
	LegalLoanDetailResponse,
	LoanApplication,
	LoanApplicationDraftCreate,
	LoanApplicationDraftUpdate,
	LoanApplicationListParams,
	LoanApplicationListResponse,
	LoanDashboardSummary,
	LoanDashboardSummaryParams,
	LoanRepaymentCreatePayload,
	LoanRepaymentRecordResponse,
	LoanRepaymentsResponse,
	LoanScheduleResponse,
	LoanScheduleWhatIfPayload,
	LoanDocument,
	LoanDocumentCreatePayload,
	LoanDocumentUploadPayload,
	LoanDocumentUploadUrlPayload,
	LoanDocumentsGroupedResponse,
	LoanActivateBacklogResponse,
	LoanWorkflowAssignPayload,
	LoanQueueListParams,
	LoanQueueListResponse,
	LoanQuoteInput,
	LoanQuoteResponse,
	LoanWorkflowStageType,
	LoanWorkflowStage,
	LoanWorkflowStageUpdatePayload,
} from "./types";

async function requestLoanDocumentUploadUrl(
	id: string,
	payload: LoanDocumentUploadUrlPayload
): Promise<{
	upload_url: string;
	required_headers_or_fields?: Record<string, string>;
	storage_provider: string;
	storage_bucket: string;
	storage_key: string;
	file_name?: string | null;
}> {
	const { data } = await apiClient.post(
		`/org/loans/${id}/documents/upload-url`,
		payload
	);
	return unwrapApiResponse(data);
}

async function uploadLoanDocumentToStage(
	id: string,
	endpoint: string,
	payload: LoanDocumentUploadPayload
): Promise<LoanDocument> {
	const fileName = payload.file.name;
	const contentType = payload.file.type || "application/octet-stream";
	const sizeBytes = payload.file.size;
	const uploadUrl = await requestLoanDocumentUploadUrl(id, {
		document_type: payload.document_type,
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
	const createPayload: LoanDocumentCreatePayload = {
		document_type: payload.document_type,
		file_name: uploadUrl.file_name ?? fileName,
		storage_key: uploadUrl.storage_key,
		storage_provider: uploadUrl.storage_provider,
		storage_bucket: uploadUrl.storage_bucket,
		content_type: contentType,
		size_bytes: sizeBytes,
	};
	const { data } = await apiClient.post<LoanDocument>(endpoint, createPayload);
	return unwrapApiResponse<LoanDocument>(data);
}

export async function getMyLoanQuote(
	payload: LoanQuoteInput
): Promise<LoanQuoteResponse> {
	const { data } = await apiClient.post<LoanQuoteResponse>(
		"/me/loan-applications/quote",
		payload
	);
	return unwrapApiResponse<LoanQuoteResponse>(data);
}

export async function createMyLoanDraft(
	payload: LoanApplicationDraftCreate
): Promise<LoanApplication> {
	const { data } = await apiClient.post<LoanApplication>(
		"/me/loan-applications",
		payload
	);
	return unwrapApiResponse<LoanApplication>(data);
}

export async function updateMyLoanDraft(
	id: string,
	payload: LoanApplicationDraftUpdate
): Promise<LoanApplication> {
	const { data } = await apiClient.patch<LoanApplication>(
		`/me/loan-applications/${id}`,
		payload
	);
	return unwrapApiResponse<LoanApplication>(data);
}

export async function submitMyLoanApplication(
	id: string
): Promise<LoanApplication> {
	const { data } = await apiClient.post<LoanApplication>(
		`/me/loan-applications/${id}/submit`
	);
	return unwrapApiResponse<LoanApplication>(data);
}

export async function cancelMyLoanApplication(
	id: string
): Promise<LoanApplication> {
	const { data } = await apiClient.post<LoanApplication>(
		`/me/loan-applications/${id}/cancel`
	);
	return unwrapApiResponse<LoanApplication>(data);
}

export async function listMyLoanApplications(
	params: LoanApplicationListParams = {}
): Promise<LoanApplicationListResponse> {
	const { data } = await apiClient.get<LoanApplicationListResponse>(
		"/me/loan-applications",
		{ params }
	);
	return unwrapApiResponse<LoanApplicationListResponse>(data);
}

export async function getMyLoanApplication(
	id: string
): Promise<LoanApplication> {
	const { data } = await apiClient.get<LoanApplication>(
		`/me/loan-applications/${id}`
	);
	return unwrapApiResponse<LoanApplication>(data);
}

export async function listMyLoanRepayments(
	id: string
): Promise<LoanRepaymentsResponse> {
	const { data } = await apiClient.get<LoanRepaymentsResponse>(
		`/me/loans/${id}/repayments`
	);
	return unwrapApiResponse<LoanRepaymentsResponse>(data);
}

export async function getMyLoanSchedule(
	id: string
): Promise<LoanScheduleResponse> {
	const { data } = await apiClient.get<LoanScheduleResponse>(
		`/me/loans/${id}/schedule`
	);
	return unwrapApiResponse<LoanScheduleResponse>(data);
}

export async function exportMyLoanCsv(id: string): Promise<Blob> {
	const { data } = await apiClient.get<Blob>(`/me/loans/${id}/export`, {
		responseType: "blob",
	});
	return data;
}

export async function listMyLoanDocuments(
	id: string
): Promise<LoanDocumentsGroupedResponse> {
	const { data } = await apiClient.get<LoanDocumentsGroupedResponse>(
		`/me/loans/${id}/documents`
	);
	return unwrapApiResponse<LoanDocumentsGroupedResponse>(data);
}

export async function registerMyLoan83bDocument(
	id: string,
	payload: LoanDocumentCreatePayload
): Promise<LoanDocument> {
	const { data } = await apiClient.post<LoanDocument>(
		`/me/loans/${id}/documents/83b`,
		payload
	);
	return unwrapApiResponse<LoanDocument>(data);
}

async function requestMyLoan83bUploadUrl(
	id: string,
	payload: LoanDocumentUploadUrlPayload
): Promise<{
	upload_url: string;
	required_headers_or_fields?: Record<string, string>;
	storage_provider: string;
	storage_bucket: string;
	storage_key: string;
	file_name?: string | null;
}> {
	const { data } = await apiClient.post(
		`/me/loans/${id}/documents/83b/upload-url`,
		payload
	);
	return unwrapApiResponse(data);
}

export async function uploadMyLoan83bDocument(
	id: string,
	payload: LoanDocumentUploadPayload
): Promise<LoanDocument> {
	const fileName = payload.file.name;
	const contentType = payload.file.type || "application/octet-stream";
	const sizeBytes = payload.file.size;
	const uploadUrl = await requestMyLoan83bUploadUrl(id, {
		document_type: payload.document_type,
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
	return registerMyLoan83bDocument(id, {
		document_type: payload.document_type,
		file_name: uploadUrl.file_name ?? fileName,
		storage_key: uploadUrl.storage_key,
		storage_provider: uploadUrl.storage_provider,
		storage_bucket: uploadUrl.storage_bucket,
		content_type: contentType,
		size_bytes: sizeBytes,
	});
}

export async function listOrgLoanApplications(
	params: LoanApplicationListParams = {}
): Promise<LoanApplicationListResponse> {
	const { data } = await apiClient.get<LoanApplicationListResponse>("/org/loans", {
		params,
	});
	return unwrapApiResponse<LoanApplicationListResponse>(data);
}

export async function listOrgLoanRepayments(
	id: string
): Promise<LoanRepaymentsResponse> {
	const { data } = await apiClient.get<LoanRepaymentsResponse>(
		`/org/loans/${id}/repayments`
	);
	return unwrapApiResponse<LoanRepaymentsResponse>(data);
}

export async function createOrgLoanRepayment(
	id: string,
	payload: LoanRepaymentCreatePayload
): Promise<LoanRepaymentRecordResponse> {
	const formData = new FormData();
	formData.append("payment_date", payload.payment_date);
	const appendIfValue = (key: string, value?: string) => {
		if (value === undefined || value === null) return;
		const normalized = String(value).trim();
		if (!normalized) return;
		formData.append(key, normalized);
	};
	appendIfValue("extra_principal_amount", payload.extra_principal_amount);
	appendIfValue("extra_interest_amount", payload.extra_interest_amount);
	appendIfValue("amount", payload.amount);
	appendIfValue("principal_amount", payload.principal_amount);
	appendIfValue("interest_amount", payload.interest_amount);
	if (payload.evidence_file) {
		const fileName = payload.evidence_file.name;
		const contentType =
			payload.evidence_file.type || "application/octet-stream";
		const sizeBytes = payload.evidence_file.size;
		const { data: uploadUrlData } = await apiClient.post(
			`/org/loans/${id}/repayments/upload-url`,
			{
				file_name: fileName,
				content_type: contentType,
				size_bytes: sizeBytes,
			}
		);
		const uploadUrl = unwrapApiResponse(uploadUrlData) as {
			upload_url: string;
			required_headers_or_fields?: Record<string, string>;
			storage_provider: string;
			storage_bucket: string;
			storage_key: string;
			file_name?: string | null;
		};
		await uploadFileToSignedUrl({
			uploadUrl: uploadUrl.upload_url,
			file: payload.evidence_file,
			contentType,
			requiredHeaders: uploadUrl.required_headers_or_fields,
		});
		formData.append("evidence_storage_key", uploadUrl.storage_key);
		formData.append("evidence_storage_provider", uploadUrl.storage_provider);
		formData.append("evidence_storage_bucket", uploadUrl.storage_bucket);
		formData.append(
			"evidence_file_name",
			uploadUrl.file_name ?? fileName
		);
		formData.append("evidence_content_type", contentType);
		formData.append("evidence_size_bytes", String(sizeBytes));
	}
	const { data } = await apiClient.post<LoanRepaymentRecordResponse>(
		`/org/loans/${id}/repayments`,
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } }
	);
	return unwrapApiResponse<LoanRepaymentRecordResponse>(data);
}

export async function getOrgLoanSchedule(
	id: string
): Promise<LoanScheduleResponse> {
	const { data } = await apiClient.get<LoanScheduleResponse>(
		`/org/loans/${id}/schedule`
	);
	return unwrapApiResponse<LoanScheduleResponse>(data);
}

export async function runOrgLoanScheduleWhatIf(
	id: string,
	payload: LoanScheduleWhatIfPayload
): Promise<LoanScheduleResponse> {
	const { data } = await apiClient.post<LoanScheduleResponse>(
		`/org/loans/${id}/schedule/what-if`,
		payload
	);
	return unwrapApiResponse<LoanScheduleResponse>(data);
}

export async function runMyLoanScheduleWhatIf(
	id: string,
	payload: LoanScheduleWhatIfPayload
): Promise<LoanScheduleResponse> {
	const { data } = await apiClient.post<LoanScheduleResponse>(
		`/me/loans/${id}/schedule/what-if`,
		payload
	);
	return unwrapApiResponse<LoanScheduleResponse>(data);
}

export async function exportOrgLoanSchedule(id: string): Promise<Blob> {
	const { data } = await apiClient.get<Blob>(
		`/org/loans/${id}/schedule/export`,
		{ responseType: "blob" }
	);
	return data;
}

export async function getLoanDashboardSummary(
	params: LoanDashboardSummaryParams = {}
): Promise<LoanDashboardSummary> {
	const { data } = await apiClient.get<LoanDashboardSummary>(
		"/org/dashboard/loan-summary",
		{ params }
	);
	return unwrapApiResponse<LoanDashboardSummary>(data);
}

export async function getOrgLoanApplication(
	id: string
): Promise<LoanApplication> {
	const { data } = await apiClient.get<LoanApplication>(`/org/loans/${id}`);
	return unwrapApiResponse<LoanApplication>(data);
}

export async function getHrLoanQueue(
	params: LoanQueueListParams = {}
): Promise<LoanQueueListResponse> {
	const { data } = await apiClient.get<LoanQueueListResponse>(
		"/org/loans/queue/hr",
		{ params }
	);
	return unwrapApiResponse<LoanQueueListResponse>(data);
}

export async function getFinanceLoanQueue(
	params: LoanQueueListParams = {}
): Promise<LoanQueueListResponse> {
	const { data } = await apiClient.get<LoanQueueListResponse>(
		"/org/loans/queue/finance",
		{ params }
	);
	return unwrapApiResponse<LoanQueueListResponse>(data);
}

export async function getLegalLoanQueue(
	params: LoanQueueListParams = {}
): Promise<LoanQueueListResponse> {
	const { data } = await apiClient.get<LoanQueueListResponse>(
		"/org/loans/queue/legal",
		{ params }
	);
	return unwrapApiResponse<LoanQueueListResponse>(data);
}

export async function getMyHrLoanQueue(
	params: LoanQueueListParams = {}
): Promise<LoanQueueListResponse> {
	const { data } = await apiClient.get<LoanQueueListResponse>(
		"/org/loans/queue/me/hr",
		{ params }
	);
	return unwrapApiResponse<LoanQueueListResponse>(data);
}

export async function getMyFinanceLoanQueue(
	params: LoanQueueListParams = {}
): Promise<LoanQueueListResponse> {
	const { data } = await apiClient.get<LoanQueueListResponse>(
		"/org/loans/queue/me/finance",
		{ params }
	);
	return unwrapApiResponse<LoanQueueListResponse>(data);
}

export async function getMyLegalLoanQueue(
	params: LoanQueueListParams = {}
): Promise<LoanQueueListResponse> {
	const { data } = await apiClient.get<LoanQueueListResponse>(
		"/org/loans/queue/me/legal",
		{ params }
	);
	return unwrapApiResponse<LoanQueueListResponse>(data);
}

export async function getHrLoanDetail(
	id: string
): Promise<HrLoanDetailResponse> {
	const { data } = await apiClient.get<HrLoanDetailResponse>(
		`/org/loans/${id}/hr`
	);
	return unwrapApiResponse<HrLoanDetailResponse>(data);
}

export async function getFinanceLoanDetail(
	id: string
): Promise<FinanceLoanDetailResponse> {
	const { data } = await apiClient.get<FinanceLoanDetailResponse>(
		`/org/loans/${id}/finance`
	);
	return unwrapApiResponse<FinanceLoanDetailResponse>(data);
}

export async function getLegalLoanDetail(
	id: string
): Promise<LegalLoanDetailResponse> {
	const { data } = await apiClient.get<LegalLoanDetailResponse>(
		`/org/loans/${id}/legal`
	);
	return unwrapApiResponse<LegalLoanDetailResponse>(data);
}

export async function updateHrStage(
	id: string,
	payload: LoanWorkflowStageUpdatePayload
): Promise<LoanWorkflowStage> {
	const { data } = await apiClient.patch<LoanWorkflowStage>(
		`/org/loans/${id}/hr`,
		payload
	);
	return unwrapApiResponse<LoanWorkflowStage>(data);
}

export async function updateFinanceStage(
	id: string,
	payload: LoanWorkflowStageUpdatePayload
): Promise<LoanWorkflowStage> {
	const { data } = await apiClient.patch<LoanWorkflowStage>(
		`/org/loans/${id}/finance`,
		payload
	);
	return unwrapApiResponse<LoanWorkflowStage>(data);
}

export async function updateLegalStage(
	id: string,
	payload: LoanWorkflowStageUpdatePayload
): Promise<LoanWorkflowStage> {
	const { data } = await apiClient.patch<LoanWorkflowStage>(
		`/org/loans/${id}/legal`,
		payload
	);
	return unwrapApiResponse<LoanWorkflowStage>(data);
}

export async function assignLoanWorkflowStage(
	id: string,
	stageType: LoanWorkflowStageType,
	payload?: LoanWorkflowAssignPayload
): Promise<LoanWorkflowStage> {
	const { data } = await apiClient.post<LoanWorkflowStage>(
		`/org/loans/${id}/workflow/${stageType}/assign`,
		payload ?? {}
	);
	return unwrapApiResponse<LoanWorkflowStage>(data);
}

export async function registerHrDocument(
	id: string,
	payload: LoanDocumentCreatePayload
): Promise<LoanDocument> {
	const { data } = await apiClient.post<LoanDocument>(
		`/org/loans/${id}/documents/hr`,
		payload
	);
	return unwrapApiResponse<LoanDocument>(data);
}

export async function uploadHrDocument(
	id: string,
	payload: LoanDocumentUploadPayload
): Promise<LoanDocument> {
	return uploadLoanDocumentToStage(id, `/org/loans/${id}/documents/hr`, payload);
}

export async function registerFinanceDocument(
	id: string,
	payload: LoanDocumentCreatePayload
): Promise<LoanDocument> {
	const { data } = await apiClient.post<LoanDocument>(
		`/org/loans/${id}/documents/finance`,
		payload
	);
	return unwrapApiResponse<LoanDocument>(data);
}

export async function uploadFinanceDocument(
	id: string,
	payload: LoanDocumentUploadPayload
): Promise<LoanDocument> {
	return uploadLoanDocumentToStage(
		id,
		`/org/loans/${id}/documents/finance`,
		payload
	);
}

export async function registerLegalDocument(
	id: string,
	payload: LoanDocumentCreatePayload
): Promise<LoanDocument> {
	const { data } = await apiClient.post<LoanDocument>(
		`/org/loans/${id}/documents/legal`,
		payload
	);
	return unwrapApiResponse<LoanDocument>(data);
}

export async function uploadLegalDocument(
	id: string,
	payload: LoanDocumentUploadPayload
): Promise<LoanDocument> {
	return uploadLoanDocumentToStage(
		id,
		`/org/loans/${id}/documents/legal`,
		payload
	);
}

export async function registerLegalIssuanceDocument(
	id: string,
	payload: LoanDocumentCreatePayload
): Promise<LoanDocument> {
	const { data } = await apiClient.post<LoanDocument>(
		`/org/loans/${id}/documents/legal-issuance`,
		payload
	);
	return unwrapApiResponse<LoanDocument>(data);
}

export async function uploadLegalIssuanceDocument(
	id: string,
	payload: LoanDocumentUploadPayload
): Promise<LoanDocument> {
	return uploadLoanDocumentToStage(
		id,
		`/org/loans/${id}/documents/legal-issuance`,
		payload
	);
}

export async function listOrgLoanDocuments(
	id: string
): Promise<LoanDocumentsGroupedResponse> {
	const { data } = await apiClient.get<LoanDocumentsGroupedResponse>(
		`/org/loans/${id}/documents`
	);
	return unwrapApiResponse<LoanDocumentsGroupedResponse>(data);
}

export async function downloadOrgLoanDocument(
	documentId: string
): Promise<Blob> {
	const { data } = await apiClient.get<Blob>(
		`/org/loans/documents/${documentId}/download`,
		{ responseType: "blob" }
	);
	return data;
}

export async function downloadMyLoanDocument(
	documentId: string
): Promise<Blob> {
	const { data } = await apiClient.get<Blob>(
		`/me/loans/documents/${documentId}/download`,
		{ responseType: "blob" }
	);
	return data;
}

export async function activateLoanBacklog(params?: {
	limit?: number;
	offset?: number;
}): Promise<LoanActivateBacklogResponse> {
	const { data } = await apiClient.post<LoanActivateBacklogResponse>(
		"/org/loans/maintenance/activate-backlog",
		undefined,
		{ params }
	);
	return unwrapApiResponse<LoanActivateBacklogResponse>(data);
}
