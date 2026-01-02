import axios, { AxiosHeaders } from "axios";
import { routes } from "./routes";
import { unwrapApiResponse } from "./api-response";

type TokenResolver = () => string | null;
type TokenUpdater = (tokens: {
	access_token: string;
	refresh_token: string;
}) => void;
type VoidHandler = () => void;

let accessTokenResolver: TokenResolver = () => null;
let refreshTokenResolver: TokenResolver = () => null;
let tenantResolver: TokenResolver = () => null;
let tokenUpdater: TokenUpdater | null = null;
let unauthorizedHandler: VoidHandler | null = null;

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

export function setTenantResolver(resolver: TokenResolver) {
	tenantResolver = resolver;
}

export function setUnauthorizedHandler(handler: VoidHandler | null) {
	unauthorizedHandler = handler;
}

apiClient.interceptors.request.use((config) => {
	const token = accessTokenResolver();
	const tenantId = tenantResolver();

	if (
		!config.headers ||
		typeof (config.headers as AxiosHeaders).set !== "function"
	) {
		config.headers = new AxiosHeaders(config.headers);
	}

	const headers = config.headers as AxiosHeaders;

	if (token) headers.set("Authorization", `Bearer ${token}`);
	if (tenantId) headers.set("X-Tenant-ID", tenantId);

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
		const detailRaw = error?.response?.data?.detail;
		const detail =
			typeof detailRaw === "string"
				? detailRaw
				: Array.isArray(detailRaw) && typeof detailRaw[0]?.msg === "string"
				? detailRaw[0].msg
				: null;

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
			return Promise.reject(error);
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
						{ headers: { "X-Tenant-ID": tenantResolver() } }
					);

					const tokens = unwrapApiResponse<{
						access_token?: string;
						refresh_token?: string;
					}>(data);

					if (tokens?.access_token && tokens?.refresh_token) {
						tokenUpdater?.(tokens as { access_token: string; refresh_token: string });
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

		return Promise.reject(error);
	}
);
