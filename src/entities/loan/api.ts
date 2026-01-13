import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	LoanApplication,
	LoanApplicationDraftCreate,
	LoanApplicationDraftUpdate,
	LoanApplicationListParams,
	LoanApplicationListResponse,
	LoanQuoteInput,
	LoanQuoteResponse,
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
