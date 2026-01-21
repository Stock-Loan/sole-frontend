import axios, { AxiosHeaders } from "axios";
import { routes } from "@/shared/lib/routes";
import { unwrapApiResponse } from "@/shared/api/response";
import type {
	StepUpHandler,
	TokenResolver,
	TokenUpdater,
	VoidHandler,
} from "@/shared/api/types";

let accessTokenResolver: TokenResolver = () => null;
let refreshTokenResolver: TokenResolver = () => null;
let orgResolver: TokenResolver = () => null;
let tokenUpdater: TokenUpdater | null = null;
let unauthorizedHandler: VoidHandler | null = null;
let stepUpHandler: StepUpHandler | null = null;

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
	baseURL,
	withCredentials: true,
});

export function setAccessTokenResolver(resolver: TokenResolver) {
	accessTokenResolver = resolver;
}

export function setRefreshTokenResolver(resolver: TokenResolver) {
	refreshTokenResolver = resolver;
}

export function setTokenUpdater(updater: TokenUpdater) {
	tokenUpdater = updater;
}

export function setOrgResolver(resolver: TokenResolver) {
	orgResolver = resolver;
}

export function setUnauthorizedHandler(handler: VoidHandler | null) {
	unauthorizedHandler = handler;
}

export function setStepUpHandler(handler: StepUpHandler | null) {
	stepUpHandler = handler;
}

apiClient.interceptors.request.use((config) => {
	const token = accessTokenResolver();
	const orgId = orgResolver();
	const rawUrl = config.url ?? "";
	const normalizedUrl = rawUrl.startsWith(baseURL)
		? rawUrl.slice(baseURL.length)
		: rawUrl;
	const isAuthLoginFlow =
		normalizedUrl.startsWith("/auth/login/") ||
		normalizedUrl.startsWith("/auth/org-discovery") ||
		normalizedUrl.startsWith("/auth/orgs/resolve");

	if (
		!config.headers ||
		typeof (config.headers as AxiosHeaders).set !== "function"
	) {
		config.headers = new AxiosHeaders(config.headers);
	}

	const headers = config.headers as AxiosHeaders;

	if (token && !isAuthLoginFlow && !headers.has("Authorization")) {
		headers.set("Authorization", `Bearer ${token}`);
	}
	if (orgId && !isAuthLoginFlow && !headers.has("X-Org-Id")) {
		headers.set("X-Org-Id", orgId);
	}

	return config;
});

apiClient.interceptors.response.use(
	(response) => {
		const responseType = response.config?.responseType;
		const shouldSkip =
			responseType === "blob" ||
			responseType === "arraybuffer" ||
			responseType === "stream";

		if (!shouldSkip) {
			response.data = unwrapApiResponse(response.data);
		}

		return response;
	},
	async (error) => {
		const originalRequest = error.config;
		const status = error?.response?.status;
		const responseData = error?.response?.data;
		const detailRaw = responseData?.detail;
		const detail =
			typeof detailRaw === "string"
				? detailRaw
				: Array.isArray(detailRaw) && typeof detailRaw[0]?.msg === "string"
					? detailRaw[0].msg
					: null;

		// Check for step-up MFA required response
		if (
			status === 403 &&
			responseData?.code === "step_up_mfa_required" &&
			responseData?.details?.step_up_required === true &&
			stepUpHandler
		) {
			const challenge = {
				step_up_required: true,
				challenge_token: responseData.details.challenge_token,
				action: responseData.details.action,
			};

			// Return a promise that will be resolved/rejected by the step-up handler
			return new Promise((resolve, reject) => {
				stepUpHandler!(challenge, {
					config: originalRequest,
					resolve,
					reject,
				});
			});
		}

		if (
			status === 403 &&
			typeof detail === "string" &&
			detail.toLowerCase().includes("password change required")
		) {
			if (
				typeof window !== "undefined" &&
				window.location.pathname !== routes.changePassword
			) {
				window.location.assign(routes.changePassword);
			}
			return Promise.reject(
				error instanceof Error ? error : new Error("Request rejected"),
			);
		}

		if (status === 401 && !originalRequest._retry) {
			const refreshToken = refreshTokenResolver();
			if (refreshToken) {
				originalRequest._retry = true;
				try {
					// Direct axios call to avoid interceptor loop
					const { data } = await axios.post(
						`${baseURL}/auth/refresh`,
						{ refresh_token: refreshToken },
						{ headers: { "X-Org-Id": orgResolver() } },
					);

					const tokens = unwrapApiResponse<{
						access_token?: string;
						refresh_token?: string;
					}>(data);

					if (tokens?.access_token && tokens?.refresh_token) {
						tokenUpdater?.(
							tokens as { access_token: string; refresh_token: string },
						);
						originalRequest.headers.Authorization = `Bearer ${tokens.access_token}`;
						return apiClient(originalRequest);
					}
				} catch {
					// Refresh failed, proceed to logout
				}
			}

			const hasToken = Boolean(accessTokenResolver());
			if (hasToken) {
				unauthorizedHandler?.();
			}
		}

		return Promise.reject(
			error instanceof Error ? error : new Error("Request failed"),
		);
	},
);
