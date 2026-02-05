const SAFE_PROTOCOLS = new Set(["http:", "https:"]);

export function sanitizeExternalUrl(value?: string | null): string | null {
	if (!value) return null;
	const trimmed = value.trim();
	if (!trimmed) return null;

	try {
		const base =
			typeof window !== "undefined" && window.location?.origin
				? window.location.origin
				: "http://localhost";
		const parsed = new URL(trimmed, base);
		if (!SAFE_PROTOCOLS.has(parsed.protocol.toLowerCase())) {
			return null;
		}
		return parsed.href;
	} catch {
		return null;
	}
}
