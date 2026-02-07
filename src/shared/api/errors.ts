import { isAxiosError } from "axios";

export class ApiError extends Error {
	public status: number | null;
	public detail: unknown;

	constructor(message: string, status: number | null = null, detail: unknown = null) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.detail = detail;
	}
}

function firstValidationMessage(items: unknown): string | null {
	if (!Array.isArray(items) || items.length === 0) return null;
	const first = items[0];
	if (!first || typeof first !== "object") return null;
	const msg = (first as { msg?: unknown }).msg;
	if (typeof msg === "string" && msg.trim().length > 0) {
		return msg;
	}
	return null;
}

function normalizeMessage(value: unknown): string | null {
	if (typeof value !== "string") return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function parseApiError(error: unknown): ApiError {
	if (isAxiosError(error)) {
		const status = error.response?.status ?? null;
		const data = error.response?.data;
		const genericNetworkMessage = "Unable to reach the server. Please try again.";

		if (!error.response) {
			return new ApiError(genericNetworkMessage, null, null);
		}

		if (data && typeof data === "object") {
			const obj = data as {
				message?: unknown;
				detail?: unknown;
				details?: unknown;
				error?: unknown;
			};

			const detailArrayMessage =
				firstValidationMessage(obj.detail) || firstValidationMessage(obj.details);
			const detailsObject =
				obj.details && typeof obj.details === "object"
					? (obj.details as { message?: unknown; detail?: unknown; column?: unknown })
					: null;

			const candidates = [
				normalizeMessage(obj.message),
				normalizeMessage(obj.detail),
				normalizeMessage(detailsObject?.message),
				normalizeMessage(detailsObject?.detail),
				normalizeMessage(obj.error),
				detailArrayMessage,
			].filter((value): value is string => Boolean(value));

			if (candidates.length > 0) {
				// Prefer a specific message when the top-level value is generic.
				const genericTopLevel =
					candidates[0].toLowerCase() === "missing required field" &&
					candidates.length > 1;
				const message = genericTopLevel ? candidates[1] : candidates[0];
				return new ApiError(message, status, data);
			}
		}

		return new ApiError(error.message || "Request failed", status, data);
	}

	if (error instanceof Error) {
		return new ApiError(error.message);
	}

	return new ApiError("An unknown error occurred");
}
