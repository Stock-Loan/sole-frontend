import type { LoanScheduleResponse } from "@/entities/loan/types";

function escapeCsvValue(value: string) {
	const shouldQuote = /[",\n\r]/.test(value);
	const escaped = value.replace(/"/g, "\"\"");
	return shouldQuote ? `"${escaped}"` : escaped;
}

export function buildScheduleCsv(schedule: LoanScheduleResponse) {
	const headers = [
		"Period",
		"Due date",
		"Payment",
		"Principal",
		"Interest",
		"Remaining balance",
	];
	const rows = schedule.entries.map((entry) =>
		[
			entry.period,
			entry.due_date,
			entry.payment,
			entry.principal,
			entry.interest,
			entry.remaining_balance,
		]
			.map((value) => escapeCsvValue(String(value ?? "")))
			.join(",")
	);
	return [headers.map(escapeCsvValue).join(","), ...rows].join("\n");
}
