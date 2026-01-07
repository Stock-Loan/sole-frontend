import { isAxiosError } from "axios";

export class ApiError extends Error {
	public status: number | null;
	public detail: unknown;

	constructor(
		message: string,
		status: number | null = null,
		detail: unknown = null
	) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.detail = detail;
	}
}

export function parseApiError(error: unknown): ApiError {
	if (isAxiosError(error)) {
		const status = error.response?.status ?? null;
		const data = error.response?.data;
		let message = error.message;

		// Try to extract a more specific message from the backend response
		if (data && typeof data === "object") {
			if ("detail" in data) {
				const detail = (data as { detail: unknown }).detail;
				if (typeof detail === "string") {
					message = detail;
				} else if (Array.isArray(detail)) {
					// FastAPI validation error style usually
					const first = detail[0];
					if (first && typeof first === "object" && "msg" in first) {
						message = first.msg;
					}
				}
			} else if ("message" in data) {
				const msg = (data as { message: unknown }).message;
				if (typeof msg === "string") {
					message = msg;
				}
			}
		}

		return new ApiError(message, status, data);
	}

	if (error instanceof Error) {
		return new ApiError(error.message);
	}

	return new ApiError("An unknown error occurred");
}
