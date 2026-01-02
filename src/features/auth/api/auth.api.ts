import { apiClient } from "@/lib/apiClient";
import { unwrapApiResponse } from "@/lib/api-response";
import type {
	AuthUser,
	ChangePasswordPayload,
	LoginCompletePayload,
	LoginStartPayload,
	LoginStartResponse,
	SelfContextResponse,
	TokenPair,
} from "../types";

export async function startLogin(payload: LoginStartPayload) {
	const { data } = await apiClient.post<LoginStartResponse>("/auth/login/start", payload);
	return unwrapApiResponse<LoginStartResponse>(data);
}

export async function completeLogin(payload: LoginCompletePayload) {
	const { data } = await apiClient.post<TokenPair>("/auth/login/complete", payload);
	return unwrapApiResponse<TokenPair>(data);
}

export async function logout(): Promise<void> {
	await apiClient.post<null>("/auth/logout");
}

export async function refreshSession(refresh_token: string) {
	const { data } = await apiClient.post<TokenPair>("/auth/refresh", { refresh_token });
	return unwrapApiResponse<TokenPair>(data);
}

export async function getMe() {
	const { data } = await apiClient.get<AuthUser>("/auth/me");
	return unwrapApiResponse<AuthUser>(data);
}

export async function changePassword(payload: ChangePasswordPayload) {
	const { data } = await apiClient.post<TokenPair>("/auth/change-password", payload);
	return unwrapApiResponse<TokenPair>(data);
}

export async function getSelfContext() {
	const { data } = await apiClient.get<SelfContextResponse>("/self/context");
	return unwrapApiResponse<SelfContextResponse>(data);
}
