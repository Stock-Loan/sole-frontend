export function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString();
}

interface FormatCurrencyOptions {
	locale?: string;
	currency?: string;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
}

export function formatCurrency(
	value?: number | string | null,
	options: FormatCurrencyOptions = {}
) {
	if (value === null || value === undefined) return "—";
	const numericValue =
		typeof value === "string"
			? Number(value.replace(/,/g, "").trim())
			: value;
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
