import type { AuditChangeEntry, AuditDiffLine } from "./types";

const MAX_VALUE_LENGTH = 180;
const MAX_CHANGE_LENGTH = 220;

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
	value: unknown,
): value is Record<string, { from?: unknown; to?: unknown }> {
	return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getAuditChangeEntries(value: unknown): AuditChangeEntry[] {
	if (!isChangeRecord(value)) return [];
	return Object.entries(value).flatMap(([field, change]) => {
		if (!change || typeof change !== "object") return [];
		const fromValue =
			"from" in change
				? formatAuditValue((change as { from?: unknown }).from)
				: "—";
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

export function diffAuditJsonLines(
	oldValue: unknown,
	newValue: unknown,
): { oldLines: AuditDiffLine[]; newLines: AuditDiffLine[] } {
	const oldText = stringifyAuditJson(oldValue);
	const newText = stringifyAuditJson(newValue);
	const oldLines = oldText ? oldText.split("\n") : [];
	const newLines = newText ? newText.split("\n") : [];

	const oldLength = oldLines.length;
	const newLength = newLines.length;

	const table: number[][] = Array.from({ length: oldLength + 1 }, () =>
		Array.from({ length: newLength + 1 }, () => 0),
	);

	for (let i = oldLength - 1; i >= 0; i -= 1) {
		for (let j = newLength - 1; j >= 0; j -= 1) {
			if (oldLines[i] === newLines[j]) {
				table[i][j] = table[i + 1][j + 1] + 1;
			} else {
				table[i][j] = Math.max(table[i + 1][j], table[i][j + 1]);
			}
		}
	}

	const diffOld: AuditDiffLine[] = [];
	const diffNew: AuditDiffLine[] = [];
	let i = 0;
	let j = 0;

	while (i < oldLength && j < newLength) {
		if (oldLines[i] === newLines[j]) {
			diffOld.push({ line: oldLines[i], type: "same" });
			diffNew.push({ line: newLines[j], type: "same" });
			i += 1;
			j += 1;
		} else if (table[i + 1][j] >= table[i][j + 1]) {
			diffOld.push({ line: oldLines[i], type: "removed" });
			i += 1;
		} else {
			diffNew.push({ line: newLines[j], type: "added" });
			j += 1;
		}
	}

	while (i < oldLength) {
		diffOld.push({ line: oldLines[i], type: "removed" });
		i += 1;
	}

	while (j < newLength) {
		diffNew.push({ line: newLines[j], type: "added" });
		j += 1;
	}

	return { oldLines: diffOld, newLines: diffNew };
}
