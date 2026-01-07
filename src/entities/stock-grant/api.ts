import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	StockGrant,
	StockGrantInput,
	StockGrantListParams,
	StockGrantListResponse,
	StockGrantUpdateInput,
	StockSummary,
	StockSummaryParams,
} from "./types";

export async function listStockGrants(
	membershipId: string,
	params: StockGrantListParams = {}
): Promise<StockGrantListResponse> {
	const { data } = await apiClient.get<StockGrantListResponse>(
		`/org/users/${membershipId}/stock/grants`,
		{ params }
	);
	return unwrapApiResponse<StockGrantListResponse>(data);
}

export async function createStockGrant(
	membershipId: string,
	payload: StockGrantInput
): Promise<StockGrant> {
	const { data } = await apiClient.post<StockGrant>(
		`/org/users/${membershipId}/stock/grants`,
		payload
	);
	return unwrapApiResponse<StockGrant>(data);
}

export async function updateStockGrant(
	grantId: string,
	payload: StockGrantUpdateInput
): Promise<StockGrant> {
	const { data } = await apiClient.patch<StockGrant>(
		`/org/stock/grants/${grantId}`,
		payload
	);
	return unwrapApiResponse<StockGrant>(data);
}

export async function getStockSummary(
	membershipId: string,
	params: StockSummaryParams = {}
): Promise<StockSummary> {
	const { data } = await apiClient.get<StockSummary>(
		`/org/users/${membershipId}/stock/summary`,
		{ params }
	);
	return unwrapApiResponse<StockSummary>(data);
}
