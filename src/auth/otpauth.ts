export interface ParsedOtpAuthUrl {
	issuer: string | null;
	account: string | null;
	secret: string | null;
}

const EMPTY_PARSED_OTPAUTH: ParsedOtpAuthUrl = {
	issuer: null,
	account: null,
	secret: null,
};

export function parseOtpAuthUrl(
	otpauthUrl?: string | null,
): ParsedOtpAuthUrl {
	if (!otpauthUrl) return EMPTY_PARSED_OTPAUTH;

	try {
		const parsed = new URL(otpauthUrl);
		if (parsed.protocol.toLowerCase() !== "otpauth:") {
			return EMPTY_PARSED_OTPAUTH;
		}

		const rawPath = parsed.pathname.replace(/^\/+/, "");
		const decodedPath = decodeURIComponent(rawPath).trim();

		let labelIssuer: string | null = null;
		let account: string | null = null;
		if (decodedPath) {
			const separatorIndex = decodedPath.indexOf(":");
			if (separatorIndex >= 0) {
				labelIssuer = decodedPath.slice(0, separatorIndex).trim() || null;
				account = decodedPath.slice(separatorIndex + 1).trim() || null;
			} else {
				account = decodedPath;
			}
		}

		const issuerParam = parsed.searchParams.get("issuer")?.trim() || null;
		const secret = parsed.searchParams.get("secret")?.trim() || null;

		return {
			issuer: issuerParam || labelIssuer,
			account,
			secret,
		};
	} catch {
		return EMPTY_PARSED_OTPAUTH;
	}
}
