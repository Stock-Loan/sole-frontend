import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import { refreshSessionWithRetry } from "@/shared/api/refresh";
import type {
	AuthOrgsResponse,
	AuthUser,
	ChangePasswordPayload,
	ImpersonateStartPayload,
	ImpersonateStartResponse,
	LoginPayload,
	LoginResponse,
	MfaEnrollStartPayload,
	MfaEnrollVerifyPayload,
	MfaSetupCompleteResponse,
	MfaSetupStartResponse,
	MfaSetupVerifyPayload,
	MfaVerifyPayload,
	MfaVerifyResponse,
	RecoveryCodesCountResponse,
	RegenerateRecoveryCodesResponse,
	SelectOrgPayload,
	SelectOrgResponse,
	SelfContextResponse,
	StepUpVerifyPayload,
	StepUpVerifyResponse,
	TokenPair,
} from "@/auth/types";

// ─── Identity-first login flow ──────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<LoginResponse> {
	const { data } = await apiClient.post<LoginResponse>("/auth/login", payload);
	return unwrapApiResponse<LoginResponse>(data) as LoginResponse;
}

export async function getAuthOrgs(
	preOrgToken: string,
): Promise<AuthOrgsResponse> {
	const { data } = await apiClient.get<AuthOrgsResponse>("/auth/orgs", {
		headers: { Authorization: `Bearer ${preOrgToken}` },
	});
	return unwrapApiResponse<AuthOrgsResponse>(data) as AuthOrgsResponse;
}

export async function selectOrg(
	payload: SelectOrgPayload,
	preOrgToken: string,
): Promise<SelectOrgResponse> {
	const { data } = await apiClient.post<SelectOrgResponse>(
		"/auth/select-org",
		payload,
		{ headers: { Authorization: `Bearer ${preOrgToken}` } },
	);
	return unwrapApiResponse<SelectOrgResponse>(data) as SelectOrgResponse;
}

export async function mfaVerify(
	payload: MfaVerifyPayload,
	preOrgToken: string,
): Promise<MfaVerifyResponse> {
	const { data } = await apiClient.post<MfaVerifyResponse>(
		"/auth/mfa/verify",
		payload,
		{ headers: { Authorization: `Bearer ${preOrgToken}` } },
	);
	return unwrapApiResponse<MfaVerifyResponse>(data) as MfaVerifyResponse;
}

export async function mfaEnrollStart(
	payload: MfaEnrollStartPayload,
	preOrgToken: string,
): Promise<MfaSetupStartResponse> {
	const { data } = await apiClient.post<MfaSetupStartResponse>(
		"/auth/mfa/enroll/start",
		payload,
		{ headers: { Authorization: `Bearer ${preOrgToken}` } },
	);
	return unwrapApiResponse<MfaSetupStartResponse>(
		data,
	) as MfaSetupStartResponse;
}

export async function mfaEnrollVerify(
	payload: MfaEnrollVerifyPayload,
	preOrgToken: string,
): Promise<MfaSetupCompleteResponse> {
	const { data } = await apiClient.post<MfaSetupCompleteResponse>(
		"/auth/mfa/enroll/verify",
		payload,
		{ headers: { Authorization: `Bearer ${preOrgToken}` } },
	);
	return unwrapApiResponse<MfaSetupCompleteResponse>(
		data,
	) as MfaSetupCompleteResponse;
}

// ─── Session management ─────────────────────────────────────────────────────

export async function logout(): Promise<void> {
	await apiClient.post<null>("/auth/logout");
}

export async function refreshSession(orgId?: string) {
	return refreshSessionWithRetry(orgId);
}

export async function refreshSessionForOrgSwitch(orgId: string) {
	return refreshSessionWithRetry(orgId);
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

// ─── Post-login MFA management ──────────────────────────────────────────────

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

// ─── Step-up MFA ─────────────────────────────────────────────────────────────

export async function verifyStepUpMfa(
	payload: StepUpVerifyPayload,
): Promise<StepUpVerifyResponse> {
	const { data } = await apiClient.post<StepUpVerifyResponse>(
		"/auth/step-up/verify",
		payload,
	);
	return unwrapApiResponse<StepUpVerifyResponse>(data) as StepUpVerifyResponse;
}

// ─── Impersonation ───────────────────────────────────────────────────────────

export async function startImpersonation(
	payload: ImpersonateStartPayload,
): Promise<ImpersonateStartResponse> {
	const { data } = await apiClient.post<ImpersonateStartResponse>(
		"/auth/impersonate/start",
		payload,
	);
	return unwrapApiResponse<ImpersonateStartResponse>(
		data,
	) as ImpersonateStartResponse;
}

export async function stopImpersonation(): Promise<TokenPair> {
	const { data } = await apiClient.post<TokenPair>(
		"/auth/impersonate/stop",
	);
	return unwrapApiResponse<TokenPair>(data) as TokenPair;
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
