import axios, { AxiosHeaders } from "axios";

type TokenResolver = () => string | null;
type VoidHandler = () => void;

let accessTokenResolver: TokenResolver = () => null;
let tenantResolver: TokenResolver = () => null;
let unauthorizedHandler: VoidHandler | null = null;

const baseURL = import.meta.env.VITE_API_BASE_URL;

export const apiClient = axios.create({
	baseURL,
	withCredentials: true,
});

export function setAccessTokenResolver(resolver: TokenResolver) {
	accessTokenResolver = resolver;
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
	(response) => response,
	(error) => {
		if (error?.response?.status === 401) {
			const hasToken = Boolean(accessTokenResolver());
			if (hasToken) {
				unauthorizedHandler?.();
			}
		}

		return Promise.reject(error);
	}
);
