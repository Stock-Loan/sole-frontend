import type { AddUserFormValues } from "./types";
import type { OrgUserDto } from "./types";

export const statusTone: Record<string, string> = {
	active: "border-emerald-200 bg-emerald-50 text-emerald-700",
	on_leave: "border-amber-200 bg-amber-50 text-amber-700",
	furloughed: "border-sky-200 bg-sky-50 text-sky-700",
	suspended: "border-rose-200 bg-rose-50 text-rose-700",
	probationary: "border-violet-200 bg-violet-50 text-violet-700",
	terminated: "border-rose-200 bg-rose-50 text-rose-700",
	retired: "border-slate-200 bg-slate-50 text-slate-700",
	resigned: "border-orange-200 bg-orange-50 text-orange-700",
};

export const defaultValues: AddUserFormValues = {
	email: "",
	first_name: "",
	middle_name: "",
	last_name: "",
	preferred_name: "",
	employment_status: "ACTIVE",
	timezone: "",
	phone_number: "",
	employee_id: "",
	employment_start_date: "",
	marital_status: "",
	country: "",
	state: "",
	address_line1: "",
	address_line2: "",
	postal_code: "",
	temporary_password: "",
};

export const BULK_ONBOARDING_FIELD_GUIDE: string[] = [
	"Required columns: email, first_name, last_name, employee_id, employment_start_date. Optional (recommended): temporary_password, employment_status, marital_status, country, state, timezone, phone_number, address fields.",
	"Date format: ISO YYYY-MM-DD. If exporting from Excel, save dates as text/ISO to avoid serial conversions.",
	"Country & state: names or codes. Examples — Countries: United States / USA / US, United Kingdom / UK / GB, India / IN. States: CA or California, NY or New York, England, London (maps to City of London), Maharashtra (diacritics handled).",
	"Timezone: IANA IDs (e.g., America/Los_Angeles, Europe/London, Asia/Tokyo).",
	"Marital status: SINGLE_NEVER_MARRIED, MARRIED, DIVORCED, WIDOWED, SEPARATED (case-insensitive).",
	"Employment status: ACTIVE, ON_LEAVE, FURLOUGHED, SUSPENDED, PROBATIONARY, TERMINATED, RETIRED, RESIGNED (case-insensitive).",
	"Address: address_line1, address_line2 (optional), postal_code as text (preserve leading zeros).",
	"Avoid merged cells/formatting: plain CSV, header row unchanged, no extra columns.",
	"Validation feedback: upload to see per-row successes/errors (row numbers, messages). Fix only rows under errors and reupload.",
];

export const BULK_ONBOARDING_VALIDATION_NOTES: string[] = [
	"Files must be UTF-8 CSV and <= 5MB; oversized or non-UTF-8 files are rejected.",
	"Header order must match the template exactly. Empty or missing headers fail validation.",
	"Maximum 30 data rows per upload. Exceeding rows returns a clear, row-numbered error.",
	"Empty files (no data rows) are rejected.",
	"Per-field length limits are enforced before fuzzy matching to avoid CPU spikes.",
	"Unexpected headers or length issues return clear row-numbered errors—remove any extra columns.",
	"Existing users are reused within the current organization. Success rows include user_status and membership_status to show whether a user or membership already existed.",
];

export function getOrgUserDisplayName(user: OrgUserDto) {
	const fullName =
		user.full_name ||
		[user.first_name, user.last_name].filter(Boolean).join(" ").trim();
	return fullName || user.email || "—";
}
