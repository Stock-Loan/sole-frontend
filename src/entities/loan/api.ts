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
	LoanDocument,
	LoanDocumentCreatePayload,
	LoanDocumentsGroupedResponse,
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

export async function listOrgLoanDocuments(
	id: string
): Promise<LoanDocumentsGroupedResponse> {
	const { data } = await apiClient.get<LoanDocumentsGroupedResponse>(
		`/org/loans/${id}/documents`
	);
	return unwrapApiResponse<LoanDocumentsGroupedResponse>(data);
}
