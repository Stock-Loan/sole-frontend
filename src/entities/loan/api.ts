import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
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
	LoanRepayment,
	LoanRepaymentsResponse,
	LoanRepaymentCreatePayload,
	LoanScheduleResponse,
	LoanDocument,
	LoanDocumentCreatePayload,
	LoanDocumentUploadPayload,
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
): Promise<LoanRepayment> {
	const formData = new FormData();
	formData.append("amount", payload.amount);
	formData.append("principal_amount", payload.principal_amount);
	formData.append("interest_amount", payload.interest_amount);
	formData.append("payment_date", payload.payment_date);
	if (payload.evidence_file) {
		formData.append("evidence_file", payload.evidence_file);
	}
	const { data } = await apiClient.post<LoanRepayment>(
		`/org/loans/${id}/repayments`,
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } }
	);
	return unwrapApiResponse<LoanRepayment>(data);
}

export async function getOrgLoanSchedule(
	id: string
): Promise<LoanScheduleResponse> {
	const { data } = await apiClient.get<LoanScheduleResponse>(
		`/org/loans/${id}/schedule`
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
	const formData = new FormData();
	formData.append("document_type", payload.document_type);
	formData.append("file", payload.file);
	const { data } = await apiClient.post<LoanDocument>(
		`/org/loans/${id}/documents/hr/upload`,
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } }
	);
	return unwrapApiResponse<LoanDocument>(data);
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
	const formData = new FormData();
	formData.append("document_type", payload.document_type);
	formData.append("file", payload.file);
	const { data } = await apiClient.post<LoanDocument>(
		`/org/loans/${id}/documents/finance/upload`,
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } }
	);
	return unwrapApiResponse<LoanDocument>(data);
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
	const formData = new FormData();
	formData.append("document_type", payload.document_type);
	formData.append("file", payload.file);
	const { data } = await apiClient.post<LoanDocument>(
		`/org/loans/${id}/documents/legal/upload`,
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } }
	);
	return unwrapApiResponse<LoanDocument>(data);
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
	const formData = new FormData();
	formData.append("document_type", payload.document_type);
	formData.append("file", payload.file);
	const { data } = await apiClient.post<LoanDocument>(
		`/org/loans/${id}/documents/legal-issuance/upload`,
		formData,
		{ headers: { "Content-Type": "multipart/form-data" } }
	);
	return unwrapApiResponse<LoanDocument>(data);
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
