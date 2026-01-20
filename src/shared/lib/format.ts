import type { FormatCurrencyOptions } from "@/shared/lib/types";

export function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString();
}

export function formatCurrency(
	value?: number | string | null,
	options: FormatCurrencyOptions = {},
) {
	if (value === null || value === undefined) return "—";
	const numericValue =
		typeof value === "string" ? Number(value.replace(/,/g, "").trim()) : value;
	if (!Number.isFinite(numericValue)) {
		return typeof value === "string" ? value : String(value);
	}

	const formatter = new Intl.NumberFormat(options.locale ?? "en-US", {
		style: "currency",
		currency: options.currency ?? "USD",
		minimumFractionDigits: options.minimumFractionDigits ?? 2,
		maximumFractionDigits: options.maximumFractionDigits ?? 2,
	});

	return formatter.format(numericValue);
}

export function formatPercent(value?: number | string | null) {
	if (value === null || value === undefined) return "—";
	const raw = String(value).trim();
	if (!raw) return "—";
	const normalized = raw.endsWith("%") ? raw.slice(0, -1).trim() : raw;
	const numericValue = Number(normalized.replace(/,/g, "").trim());
	if (!Number.isFinite(numericValue)) {
		return raw.endsWith("%") ? raw : `${raw}%`;
	}

	const rounded =
		Math.abs(numericValue - Math.round(numericValue)) < 1e-9
			? String(Math.round(numericValue))
			: numericValue.toFixed(1);

	return `${rounded}%`;
}

export function formatYears(value?: number | string | null) {
	if (value === null || value === undefined) return "—";
	const raw = String(value).trim();
	if (!raw) return "—";
	const numericValue = Number(raw.replace(/,/g, "").trim());
	if (!Number.isFinite(numericValue)) {
		return raw;
	}
	return Math.abs(numericValue - Math.round(numericValue)) < 1e-9
		? String(Math.round(numericValue))
		: numericValue.toFixed(1);
}

export function formatYearsInText(text: string) {
	if (!text) return text;
	return text.replace(/(\d+(?:\.\d+)?)(?=\s*years?\b)/gi, (match) =>
		formatYears(match),
	);
}

export function formatRate(
	value: string | number | null | undefined,
	decimals: number,
) {
	if (value === null || value === undefined) return "—";
	const numeric = Number(String(value).replace(/%/g, "").trim());
	if (!Number.isFinite(numeric)) return String(value);
	return `${numeric.toFixed(decimals)}%`;
}

export function parseNumber(value: number | string | null | undefined) {
	if (value === null || value === undefined || value === "") return null;
	const numeric = typeof value === "number" ? value : Number(value);
	return Number.isFinite(numeric) ? numeric : null;
}
