import type {
	LoanAdminEditFormValues,
	LoanAdminEditPayload,
	LoanApplication,
} from "@/entities/loan/types";

const normalizeString = (value?: string | null) => (value ?? "").trim();

function toOptionalNumber(value: string) {
	const trimmed = value.trim();
	if (!trimmed) return null;
	const parsed = Number(trimmed);
	return Number.isFinite(parsed) ? parsed : null;
}

export function buildLoanAdminEditPayload(
	values: LoanAdminEditFormValues,
	loan?: LoanApplication | null
): LoanAdminEditPayload {
	const payload: LoanAdminEditPayload = {
		note: values.note.trim(),
		reset_workflow: values.reset_workflow,
		delete_documents: values.delete_documents,
	};

	const currentSelectionMode =
		loan?.selection_mode ?? loan?.quote_inputs_snapshot?.selection_mode ?? null;
	if (values.selection_mode !== currentSelectionMode) {
		payload.selection_mode = values.selection_mode;
	}

	const selectionValue = normalizeString(values.selection_value);
	const currentSelectionValue = normalizeString(
		loan?.selection_value_snapshot ?? loan?.quote_inputs_snapshot?.selection_value
	);
	if (selectionValue !== currentSelectionValue) {
		payload.selection_value = selectionValue || null;
	}

	const asOfDate = normalizeString(values.as_of_date);
	const currentAsOfDate = normalizeString(
		loan?.as_of_date ?? loan?.quote_inputs_snapshot?.as_of_date
	);
	if (asOfDate !== currentAsOfDate) {
		payload.as_of_date = asOfDate || null;
	}

	const currentInterest =
		loan?.quote_inputs_snapshot?.desired_interest_type ?? loan?.interest_type ?? "";
	if (
		values.desired_interest_type &&
		values.desired_interest_type !== currentInterest
	) {
		payload.desired_interest_type = values.desired_interest_type;
	}

	const currentRepayment =
		loan?.quote_inputs_snapshot?.desired_repayment_method ??
		loan?.repayment_method ??
		"";
	if (
		values.desired_repayment_method &&
		values.desired_repayment_method !== currentRepayment
	) {
		payload.desired_repayment_method = values.desired_repayment_method;
	}

	const currentTerm =
		loan?.quote_inputs_snapshot?.desired_term_months ?? loan?.term_months ?? null;
	const termValue = toOptionalNumber(values.desired_term_months);
	if (termValue !== null && termValue !== currentTerm) {
		payload.desired_term_months = termValue;
	}

	const maritalValue = normalizeString(values.marital_status_snapshot);
	const currentMarital = normalizeString(loan?.marital_status_snapshot);
	if (maritalValue !== currentMarital) {
		payload.marital_status_snapshot = maritalValue || null;
	}

	if (maritalValue && maritalValue !== "MARRIED") {
		payload.spouse_first_name = null;
		payload.spouse_middle_name = null;
		payload.spouse_last_name = null;
		payload.spouse_email = null;
		payload.spouse_phone = null;
		payload.spouse_address = null;
	} else {
		const applySpouseChange = (
			key:
				| "spouse_first_name"
				| "spouse_middle_name"
				| "spouse_last_name"
				| "spouse_email"
				| "spouse_phone"
				| "spouse_address",
			nextValue: string,
			currentValue?: string | null
		) => {
			const nextNormalized = normalizeString(nextValue);
			const currentNormalized = normalizeString(currentValue);
			if (nextNormalized !== currentNormalized) {
				payload[key] = nextNormalized || null;
			}
		};

		applySpouseChange(
			"spouse_first_name",
			values.spouse_first_name,
			loan?.spouse_first_name
		);
		applySpouseChange(
			"spouse_middle_name",
			values.spouse_middle_name,
			loan?.spouse_middle_name
		);
		applySpouseChange(
			"spouse_last_name",
			values.spouse_last_name,
			loan?.spouse_last_name
		);
		applySpouseChange(
			"spouse_email",
			values.spouse_email,
			loan?.spouse_email
		);
		applySpouseChange(
			"spouse_phone",
			values.spouse_phone,
			loan?.spouse_phone
		);
		applySpouseChange(
			"spouse_address",
			values.spouse_address,
			loan?.spouse_address
		);
	}

	return payload;
}
