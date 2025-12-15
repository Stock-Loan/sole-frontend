import type { AddUserFormValues } from "./types";

export const statusTone: Record<string, string> = {
	active: "border-emerald-200 bg-emerald-50 text-emerald-700",
	inactive: "border-slate-200 bg-slate-50 text-slate-700",
	terminated: "border-rose-200 bg-rose-50 text-rose-700",
	leave: "border-amber-200 bg-amber-50 text-amber-700",
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
