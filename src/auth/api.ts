import { apiClient } from "@/shared/api/http";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	AuthUser,
	ChangePasswordPayload,
	LoginCompletePayload,
	LoginStartPayload,
	LoginStartResponse,
	OrgDiscoveryPayload,
	OrgDiscoveryResponse,
	SelfContextResponse,
	TokenPair,
} from "@/auth/types";
import type { OrgSummary } from "@/entities/org/types";

export async function discoverOrg(payload: OrgDiscoveryPayload): Promise<OrgSummary[]> {
	const { data } = await apiClient.post<OrgDiscoveryResponse>(
		"/auth/org-discovery",
		payload
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
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined
	);
	return unwrapApiResponse<LoginStartResponse>(data);
}

export async function completeLogin(payload: LoginCompletePayload, orgId?: string) {
	const { data } = await apiClient.post<TokenPair>(
		"/auth/login/complete",
		payload,
		orgId ? { headers: { "X-Org-Id": orgId } } : undefined
	);
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
	const { data } = await apiClient.post<TokenPair>("/auth/change-password", payload);
	return unwrapApiResponse<TokenPair>(data);
}

export async function changePasswordWithToken(
	payload: ChangePasswordPayload,
	accessToken?: string
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
			: undefined
	);
	return unwrapApiResponse<TokenPair>(data);
}

export async function getSelfContext() {
	const { data } = await apiClient.get<SelfContextResponse>("/self/context");
	return unwrapApiResponse<SelfContextResponse>(data);
}
