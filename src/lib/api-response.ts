import type { ApiEnvelope } from "@/types/api";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
	if (!isRecord(value)) return false;
	return (
		"code" in value &&
		"data" in value &&
		"message" in value &&
		typeof value.code === "string" &&
		typeof value.message === "string"
	);
}

export function unwrapApiResponse<T>(value: unknown): T {
	if (isApiEnvelope<T>(value)) {
		return value.data as T;
	}
	return value as T;
}
