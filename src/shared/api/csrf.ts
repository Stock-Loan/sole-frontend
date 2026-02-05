export const CSRF_STORAGE_KEY = "sole_csrf_token";

export function getCsrfToken(): string | null {
	if (typeof sessionStorage === "undefined") return null;
	try {
		const fromSession = sessionStorage.getItem(CSRF_STORAGE_KEY);
		if (fromSession) return fromSession;
		if (typeof localStorage === "undefined") return null;
		return localStorage.getItem(CSRF_STORAGE_KEY);
	} catch {
		return null;
	}
}

export function setCsrfToken(token?: string | null) {
	if (typeof sessionStorage === "undefined") return;
	try {
		if (token) {
			sessionStorage.setItem(CSRF_STORAGE_KEY, token);
			if (typeof localStorage !== "undefined") {
				localStorage.setItem(CSRF_STORAGE_KEY, token);
			}
		} else {
			sessionStorage.removeItem(CSRF_STORAGE_KEY);
			if (typeof localStorage !== "undefined") {
				localStorage.removeItem(CSRF_STORAGE_KEY);
			}
		}
	} catch {
		// ignore storage errors
	}
}
