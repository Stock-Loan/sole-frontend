export function getJwtExpiry(token: string): number | null {
	try {
		const [, payload] = token.split(".");
		if (!payload) return null;
		const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
		const padded =
			normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
		const json = JSON.parse(atob(padded)) as { exp?: number };
		return typeof json.exp === "number" ? json.exp : null;
	} catch {
		return null;
	}
}
