import { apiClient } from "@/lib/apiClient";
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
	return data;
}

export async function completeLogin(payload: LoginCompletePayload) {
	const { data } = await apiClient.post<TokenPair>("/auth/login/complete", payload);
	return data;
}

export async function logout() {
	await apiClient.post("/auth/logout");
}

export async function refreshSession(refresh_token: string) {
	const { data } = await apiClient.post<TokenPair>("/auth/refresh", { refresh_token });
	return data;
}

export async function getMe() {
	const { data } = await apiClient.get<AuthUser>("/auth/me");
	return data;
}

export async function changePassword(payload: ChangePasswordPayload) {
	const { data } = await apiClient.post<TokenPair>("/auth/change-password", payload);
	return data;
}

export async function getSelfContext() {
	const { data } = await apiClient.get<SelfContextResponse>("/self/context");
	return data;
}
