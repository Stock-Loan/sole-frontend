import { useMemo } from "react";
import type {
	LoanInterestType,
	LoanRepaymentMethod,
} from "@/entities/org/types";
import { getStockValueMetrics } from "@/entities/stock-grant/utils";
import type {
	UseLoanWizardDerivedArgs,
	LoanWizardDerivedState,
} from "../types";

export function useLoanWizardDerived({
	selectionMode,
	selectionValue,
	desiredInterestType,
	desiredRepaymentMethod,
	desiredTermMonths,
	maritalConfirmation,
	maritalStatusSnapshot,
	draft,
	policy,
	summary,
	hrMaritalStatus,
	todayIso,
}: UseLoanWizardDerivedArgs): LoanWizardDerivedState {
	const draftSelectionMode =
		draft?.selection_mode ?? draft?.quote_inputs_snapshot?.selection_mode;
	const draftSelectionValue =
		draft?.selection_value_snapshot ??
		draft?.quote_inputs_snapshot?.selection_value;
	const draftInterestType = (draft?.interest_type ??
		draft?.quote_option_snapshot?.interest_type ??
		draft?.quote_inputs_snapshot?.desired_interest_type) as
		| LoanInterestType
		| undefined;
	const draftRepaymentMethod = (draft?.repayment_method ??
		draft?.quote_option_snapshot?.repayment_method ??
		draft?.quote_inputs_snapshot?.desired_repayment_method) as
		| LoanRepaymentMethod
		| undefined;
	const draftTermMonths =
		draft?.term_months ??
		draft?.quote_option_snapshot?.term_months ??
		draft?.quote_inputs_snapshot?.desired_term_months;
	const draftMaritalSnapshot = draft?.marital_status_snapshot ?? null;

	const resolvedSelectionMode = selectionMode ?? draftSelectionMode ?? "SHARES";
	const resolvedSelectionValue =
		selectionValue !== undefined ? selectionValue : draftSelectionValue ?? "";
	const resolvedAsOfDate = draft?.as_of_date ?? todayIso;

	const resolvedInterestType = useMemo(() => {
		if (!policy?.allowed_interest_types?.length) {
			return desiredInterestType ?? draftInterestType ?? null;
		}
		if (
			desiredInterestType &&
			policy.allowed_interest_types.includes(desiredInterestType)
		) {
			return desiredInterestType;
		}
		if (
			draftInterestType &&
			policy.allowed_interest_types.includes(draftInterestType)
		) {
			return draftInterestType;
		}
		return policy.allowed_interest_types[0] ?? null;
	}, [desiredInterestType, draftInterestType, policy]);

	const resolvedRepaymentMethod = useMemo(() => {
		if (!policy?.allowed_repayment_methods?.length) {
			return desiredRepaymentMethod ?? draftRepaymentMethod ?? null;
		}
		if (
			desiredRepaymentMethod &&
			policy.allowed_repayment_methods.includes(desiredRepaymentMethod)
		) {
			return desiredRepaymentMethod;
		}
		if (
			draftRepaymentMethod &&
			policy.allowed_repayment_methods.includes(draftRepaymentMethod)
		) {
			return draftRepaymentMethod;
		}
		return policy.allowed_repayment_methods[0] ?? null;
	}, [desiredRepaymentMethod, draftRepaymentMethod, policy]);

	const resolvedTermMonths = useMemo(() => {
		if (desiredTermMonths !== undefined) {
			return desiredTermMonths ?? null;
		}
		const fallback = draftTermMonths ?? policy?.min_loan_term_months ?? null;
		if (!policy || fallback === null || typeof fallback !== "number") {
			return fallback;
		}
		if (fallback < policy.min_loan_term_months) {
			return policy.min_loan_term_months;
		}
		if (fallback > policy.max_loan_term_months) {
			return policy.max_loan_term_months;
		}
		return fallback;
	}, [desiredTermMonths, draftTermMonths, policy]);

	const eligibility = summary?.eligibility_result;
	const totalVestedShares = summary?.total_vested_shares ?? null;
	const totalReservedShares = summary?.total_reserved_shares ?? null;
	const totalAvailableVestedShares =
		summary?.total_available_vested_shares ??
		eligibility?.total_vested_shares ??
		null;
	const totalExercisableShares =
		totalAvailableVestedShares ?? totalVestedShares ?? 0;
	const averageExercisePrice =
		getStockValueMetrics(summary).averageExercisePrice ?? null;
	const selectionValueNumber = Number(resolvedSelectionValue);
	const selectionValueValid =
		Number.isFinite(selectionValueNumber) && selectionValueNumber > 0;
	const sharesToExercise =
		resolvedSelectionMode === "PERCENT"
			? selectionValueValid
				? Math.floor((selectionValueNumber / 100) * totalExercisableShares)
				: 0
			: selectionValueValid
			? Math.floor(selectionValueNumber)
			: 0;
	const estimatedPurchasePrice =
		averageExercisePrice && sharesToExercise > 0
			? averageExercisePrice * sharesToExercise
			: null;
	const selectionWithinLimit =
		resolvedSelectionMode === "PERCENT"
			? selectionValueValid && selectionValueNumber <= 100
			: selectionValueValid && sharesToExercise <= totalExercisableShares;
	const canProceedFromStep1 =
		Boolean(summary) &&
		Boolean(eligibility?.eligible_to_exercise) &&
		selectionValueValid &&
		selectionWithinLimit;
	const interestTypeValid = Boolean(
		policy &&
			resolvedInterestType !== null &&
			policy.allowed_interest_types.includes(resolvedInterestType)
	);
	const repaymentMethodValid = Boolean(
		policy &&
			resolvedRepaymentMethod !== null &&
			policy.allowed_repayment_methods.includes(resolvedRepaymentMethod)
	);
	const termValid =
		Boolean(policy) &&
		typeof resolvedTermMonths === "number" &&
		resolvedTermMonths >= (policy?.min_loan_term_months ?? 0) &&
		resolvedTermMonths <= (policy?.max_loan_term_months ?? 0);
	const resolvedMaritalSnapshot =
		maritalConfirmation === false
			? null
			: maritalStatusSnapshot ?? draftMaritalSnapshot ?? null;
	const resolvedMaritalConfirmation =
		maritalConfirmation ??
		(draftMaritalSnapshot !== null && draftMaritalSnapshot !== undefined
			? true
			: null);
	const requiresSpouseInfo = useMemo(() => {
		if (resolvedMaritalConfirmation !== true) return false;
		const status = (resolvedMaritalSnapshot ?? hrMaritalStatus ?? "")
			.toString()
			.toLowerCase()
			.replace(/[_\s]/g, "");
		return status.includes("married") || status.includes("domesticpartner");
	}, [hrMaritalStatus, resolvedMaritalConfirmation, resolvedMaritalSnapshot]);

	return {
		resolvedSelectionMode,
		resolvedSelectionValue,
		resolvedAsOfDate,
		resolvedInterestType,
		resolvedRepaymentMethod,
		resolvedTermMonths,
		selectionValueValid,
		selectionWithinLimit,
		sharesToExercise,
		estimatedPurchasePrice,
		totalExercisableShares,
		totalVestedShares,
		totalReservedShares,
		totalAvailableVestedShares,
		canProceedFromStep1,
		interestTypeValid,
		repaymentMethodValid,
		termValid,
		resolvedMaritalSnapshot,
		resolvedMaritalConfirmation,
		requiresSpouseInfo,
	};
}
