import { isAxiosError } from "axios";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function extractErrorMessage(error: unknown): string | null {
	if (isAxiosError(error)) {
		const data = error.response?.data as
			| { detail?: unknown; message?: unknown }
			| string
			| undefined;
		if (typeof data === "string") return data;
		const detail = data?.detail ?? data?.message;
		const messageFromDetail = pickMessage(detail);
		if (messageFromDetail) return messageFromDetail;
		if (typeof error.message === "string") return error.message;
	} else if (error instanceof Error) {
		return error.message;
	}
	return null;
}

function pickMessage(detail: unknown): string | null {
	if (!detail) return null;
	if (typeof detail === "string") return detail;
	if (Array.isArray(detail) && detail.length) {
		return pickMessage(detail[0]);
	}
	if (typeof detail === "object") {
		const record = detail as Record<string, unknown>;
		if (typeof record.msg === "string") return record.msg;
		if (typeof record.message === "string") return record.message;
		if (typeof record.detail === "string") return record.detail;
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
