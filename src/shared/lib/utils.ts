import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

function pickMessage(detail: unknown): string | null {
	if (!detail) return null;
	if (typeof detail === "string") {
		const trimmed = detail.trim();
		return trimmed.length > 0 ? trimmed : null;
	}
	if (Array.isArray(detail) && detail.length) {
		for (const item of detail) {
			const message = pickMessage(item);
			if (message) return message;
		}
		return null;
	}
	if (typeof detail === "object") {
		const record = detail as Record<string, unknown>;
		const orderedCandidates = [
			record.msg,
			record.message,
			record.detail,
			record.error,
			record.column,
		];
		for (const candidate of orderedCandidates) {
			const message = pickMessage(candidate);
			if (message) return message;
		}
	}
	return null;
}

export function extractErrorMessage(error: unknown): string | null {
	if (isAxiosError(error)) {
		const data = error.response?.data as
			| { detail?: unknown; message?: unknown; details?: unknown; error?: unknown }
			| string
			| undefined;
		if (typeof data === "string") return data;

		const candidates = [
			pickMessage(data?.detail),
			pickMessage(data?.details),
			pickMessage(data?.message),
			pickMessage(data?.error),
		];
		const specific = candidates.find((value) => Boolean(value));
		if (specific) return specific;

		if (typeof error.message === "string") return error.message;
	} else if (error instanceof Error) {
		return error.message;
	}
	return null;
}

export function normalizeDisplay(value?: string | null) {
	if (!value) return "—";
	const trimmed = value.trim();
	if (!trimmed) return "—";
	if (trimmed.includes("@")) return trimmed;
	const spaced = trimmed.replace(/_/g, " ");
	return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}
