const MAX_VALUE_LENGTH = 180;
const MAX_CHANGE_LENGTH = 220;

type AuditChangeEntry = {
	field: string;
	from: string;
	to: string;
};

export function stringifyAuditValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return Object.prototype.toString.call(value);
	}
}

export function stringifyAuditJson(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return Object.prototype.toString.call(value);
	}
}

export function formatAuditValue(value: unknown): string {
	const stringified = stringifyAuditValue(value);
	if (!stringified) return "—";
	if (stringified.length <= MAX_VALUE_LENGTH) return stringified;
	return `${stringified.slice(0, MAX_VALUE_LENGTH)}…`;
}

function isChangeRecord(
	value: unknown
): value is Record<string, { from?: unknown; to?: unknown }> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getAuditChangeEntries(value: unknown): AuditChangeEntry[] {
	if (!isChangeRecord(value)) return [];
	return Object.entries(value).flatMap(([field, change]) => {
		if (!change || typeof change !== "object") return [];
		const fromValue =
			"from" in change ? formatAuditValue((change as { from?: unknown }).from) : "—";
		const toValue =
			"to" in change ? formatAuditValue((change as { to?: unknown }).to) : "—";
		return [{ field, from: fromValue, to: toValue }];
	});
}

export function formatAuditChanges(value: unknown): string {
	const entries = getAuditChangeEntries(value);
	if (!entries.length) return formatAuditValue(value);
	const combined = entries
		.map((entry) => `${entry.field}: ${entry.from} -> ${entry.to}`)
		.join(" | ");
	if (combined.length <= MAX_CHANGE_LENGTH) return combined;
	return `${combined.slice(0, MAX_CHANGE_LENGTH)}…`;
}
