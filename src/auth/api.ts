import axios from "axios";
import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import { getCsrfToken } from "@/shared/api/csrf";
import type {
	AuthUser,
	ChangePasswordPayload,
	LoginCompletePayload,
	LoginCompleteResponse,
	LoginMfaPayload,
	LoginMfaRecoveryPayload,
	LoginMfaResponse,
	LoginMfaSetupStartPayload,
	LoginMfaSetupVerifyPayload,
	LoginStartPayload,
	LoginStartResponse,
	MfaSetupCompleteResponse,
	MfaSetupStartResponse,
	MfaSetupVerifyPayload,
	OrgDiscoveryPayload,
	OrgDiscoveryResponse,
	RecoveryCodesCountResponse,
	RegenerateRecoveryCodesResponse,
	SelfContextResponse,
	StepUpVerifyPayload,
	StepUpVerifyResponse,
	TokenPair,
} from "@/auth/types";
import type { OrgSummary } from "@/entities/org/types";

const baseURL = import.meta.env.VITE_API_BASE_URL;

export async function discoverOrg(
	payload: OrgDiscoveryPayload,
): Promise<OrgSummary[]> {
	const { data } = await apiClient.post<OrgDiscoveryResponse>(
		"/auth/org-discovery",
		payload,
	);
	const response = unwrapApiResponse<OrgDiscoveryResponse>(data);
	return (response?.orgs ?? []).map((org) => ({
		id: org.org_id,
		name: org.name,
		slug: org.slug,
	}));
}

export async function startLogin(payload: LoginStartPayload, orgId?: string) {
	const { data } = await apiClient.post<LoginStartResponse>(
		"/auth/login/start",
		payload,
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined,
	);
	return unwrapApiResponse<LoginStartResponse>(data);
}

export async function completeLogin(
	payload: LoginCompletePayload,
	orgId?: string,
) {
	const { data } = await apiClient.post<LoginCompleteResponse>(
		"/auth/login/complete",
		payload,
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined,
	);
	return unwrapApiResponse<LoginCompleteResponse>(data);
}

export async function loginMfa(payload: LoginMfaPayload, orgId?: string) {
	const { data } = await apiClient.post<LoginMfaResponse>(
		"/auth/login/mfa",
		payload,
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined,
	);
	return unwrapApiResponse<LoginMfaResponse>(data);
}

export async function loginMfaSetupStart(
	payload: LoginMfaSetupStartPayload,
	orgId?: string,
) {
	const { data } = await apiClient.post<MfaSetupStartResponse>(
		"/auth/login/mfa/setup/start",
		payload,
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined,
	);
	return unwrapApiResponse<MfaSetupStartResponse>(data);
}

export async function loginMfaSetupVerify(
	payload: LoginMfaSetupVerifyPayload,
	orgId?: string,
) {
	const { data } = await apiClient.post<MfaSetupCompleteResponse>(
		"/auth/login/mfa/setup/verify",
		payload,
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined,
	);
	return unwrapApiResponse<MfaSetupCompleteResponse>(data);
}

export async function loginMfaRecovery(
	payload: LoginMfaRecoveryPayload,
	orgId?: string,
) {
	const { data } = await apiClient.post<LoginMfaResponse>(
		"/auth/login/mfa/recovery",
		payload,
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined,
	);
	return unwrapApiResponse<LoginMfaResponse>(data);
}

export async function logout(): Promise<void> {
	await apiClient.post<null>("/auth/logout");
}

export async function refreshSession(orgId?: string) {
	const { data } = await apiClient.post<TokenPair>(
		"/auth/refresh",
		undefined,
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined,
	);
	return unwrapApiResponse<TokenPair>(data);
}

export async function refreshSessionForOrgSwitch(orgId: string) {
	const csrfToken = getCsrfToken();
	const headers: Record<string, string> = { "X-Org-Id": orgId };
	if (csrfToken) {
		headers["X-CSRF-Token"] = csrfToken;
	}
	const { data } = await axios.post<TokenPair>(
		`${baseURL}/auth/refresh`,
		undefined,
		{ headers, withCredentials: true },
	);
	return unwrapApiResponse<TokenPair>(data);
}

export async function getMe() {
	const { data } = await apiClient.get<AuthUser>("/auth/me");
	return unwrapApiResponse<AuthUser>(data);
}

export async function getMeWithToken(accessToken: string, orgId?: string) {
	const { data } = await apiClient.get<AuthUser>("/auth/me", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
			...(orgId ? { "X-Org-Id": orgId } : {}),
		},
	});
	return unwrapApiResponse<AuthUser>(data);
}

export async function changePassword(payload: ChangePasswordPayload) {
	const { data } = await apiClient.post<TokenPair>(
		"/auth/change-password",
		payload,
	);
	return unwrapApiResponse<TokenPair>(data);
}

export async function mfaSetupStart() {
	const { data } = await apiClient.post<MfaSetupStartResponse>(
		"/auth/mfa/setup/start",
	);
	return unwrapApiResponse<MfaSetupStartResponse>(data);
}

export async function mfaSetupVerify(payload: MfaSetupVerifyPayload) {
	const { data } = await apiClient.post<MfaSetupCompleteResponse>(
		"/auth/mfa/setup/verify",
		payload,
	);
	return unwrapApiResponse<MfaSetupCompleteResponse>(data);
}

export async function getRecoveryCodesCount() {
	const { data } = await apiClient.get<RecoveryCodesCountResponse>(
		"/auth/mfa/recovery-codes/count",
	);
	return unwrapApiResponse<RecoveryCodesCountResponse>(data);
}

export async function regenerateRecoveryCodes() {
	const { data } = await apiClient.post<RegenerateRecoveryCodesResponse>(
		"/auth/mfa/recovery-codes/regenerate",
	);
	return unwrapApiResponse<RegenerateRecoveryCodesResponse>(data);
}

export async function selfMfaReset() {
	const { data } = await apiClient.post<{ message: string }>("/auth/mfa/reset");
	return unwrapApiResponse<{ message: string }>(data);
}

export async function adminResetUserMfa(membershipId: string) {
	const { data } = await apiClient.post<{ message: string }>(
		`/org/users/${membershipId}/mfa/reset`,
	);
	return unwrapApiResponse<{ message: string }>(data);
}

export async function changePasswordWithToken(
	payload: ChangePasswordPayload,
	accessToken?: string,
) {
	const { data } = await apiClient.post<TokenPair>(
		"/auth/change-password",
		payload,
		accessToken
			? {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				}
			: undefined,
	);
	return unwrapApiResponse<TokenPair>(data);
}

export async function getSelfContext() {
	const { data } = await apiClient.get<SelfContextResponse>("/self/context");
	return unwrapApiResponse<SelfContextResponse>(data);
}

export async function verifyStepUpMfa(
	payload: StepUpVerifyPayload,
): Promise<StepUpVerifyResponse> {
	const { data } = await apiClient.post<StepUpVerifyResponse>(
		"/auth/step-up/verify",
		payload,
	);
	return unwrapApiResponse<StepUpVerifyResponse>(data) as StepUpVerifyResponse;
}

export async function retryRequestWithStepUpToken<T>(
	originalConfig: Record<string, unknown>,
	stepUpToken: string,
): Promise<T> {
	const existingHeaders = (originalConfig.headers ?? {}) as Record<
		string,
		string
	>;
	const newConfig = {
		...originalConfig,
		headers: {
			...existingHeaders,
			"X-Step-Up-Token": stepUpToken,
		},
	};
	const response = await apiClient.request<T>(newConfig);
	return response.data;
}
