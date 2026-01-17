const MAX_VALUE_LENGTH = 180;

export function stringifyAuditValue(value: unknown): string {
	if (value === null || value === undefined) return "";
	if (typeof value === "string") return value;
	try {
		return JSON.stringify(value);
	} catch {
		return String(value);
	}
}

export function formatAuditValue(value: unknown): string {
	const stringified = stringifyAuditValue(value);
	if (!stringified) return "—";
	if (stringified.length <= MAX_VALUE_LENGTH) return stringified;
	return `${stringified.slice(0, MAX_VALUE_LENGTH)}…`;
}
