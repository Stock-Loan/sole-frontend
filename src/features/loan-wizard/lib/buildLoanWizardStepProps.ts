import type {
	LoanWizardExerciseStepProps,
	LoanWizardMaritalStepProps,
	LoanWizardReviewStepProps,
	LoanWizardTermsStepProps,
} from "@/entities/loan/types";
import { formatShares } from "@/entities/stock-grant/constants";
import type { LoanInterestType, LoanRepaymentMethod } from "@/entities/org/types";
import type {
	ExerciseStepArgs,
	MaritalStepArgs,
	ReviewStepArgs,
	TermsStepArgs,
} from "@/features/loan-wizard/types";

function getSelectionInputError({
	selectionMode,
	selectionValue,
	totalAvailableVestedShares,
	totalExercisableShares,
}: {
	selectionMode: ExerciseStepArgs["selectionMode"];
	selectionValue: ExerciseStepArgs["selectionValue"];
	totalAvailableVestedShares: ExerciseStepArgs["totalAvailableVestedShares"];
	totalExercisableShares: ExerciseStepArgs["totalExercisableShares"];
}): string | null {
	if (!selectionValue) return null;
	const numericValue = Number(selectionValue);
	if (!Number.isFinite(numericValue) || numericValue <= 0) {
		return null;
	}

	if (selectionMode === "PERCENT" && numericValue > 100) {
		return "Percent cannot exceed 100%.";
	}

	if (selectionMode === "SHARES") {
		const availableShares = totalAvailableVestedShares ?? totalExercisableShares;
		if (numericValue > availableShares) {
			return `You entered ${formatShares(Math.floor(numericValue))} shares, but only ${formatShares(
				availableShares
			)} are available to exercise.`;
		}
	}

	return null;
}

export function buildExerciseStepProps({
	summaryQuery,
	hasSummary,
	selectionMode,
	selectionValue,
	selectionError,
	setSelectionMode,
	setSelectionValue,
	setSelectionError,
	setHasUnsavedChanges,
	clearSubmitError,
	totalExercisableShares,
	totalVestedShares,
	totalReservedShares,
	totalAvailableVestedShares,
	sharesToExercise,
	estimatedPurchasePrice,
}: ExerciseStepArgs): LoanWizardExerciseStepProps {
	return {
		isLoading: summaryQuery.isLoading,
		isError: summaryQuery.isError,
		onRetry: () => summaryQuery.refetch(),
		hasSummary,
		selectionMode,
		selectionValue,
		selectionError,
		onSelectionModeChange: (mode) => {
			setSelectionMode(mode);
			setSelectionValue("");
			setSelectionError(null);
			setHasUnsavedChanges(true);
			clearSubmitError();
		},
		onSelectionValueChange: (value) => {
			setSelectionValue(value);
			setSelectionError(
				getSelectionInputError({
					selectionMode,
					selectionValue: value,
					totalAvailableVestedShares,
					totalExercisableShares,
				})
			);
			setHasUnsavedChanges(true);
			clearSubmitError();
		},
		totalExercisableShares,
		totalVestedShares,
		totalReservedShares,
		totalAvailableVestedShares,
		sharesToExercise,
		estimatedPurchasePrice,
	};
}

export function buildTermsStepProps({
	policyQuery,
	policy,
	interestType,
	repaymentMethod,
	termMonths,
	setDesiredInterestType,
	setDesiredRepaymentMethod,
	setDesiredTermMonths,
	setTermsError,
	setSelectedQuoteIndex,
	setHasUnsavedChanges,
	clearSubmitError,
	termsError,
	quote,
	quoteOptions,
	selectedQuoteIndex,
	quoteQuery,
}: TermsStepArgs): LoanWizardTermsStepProps {
	return {
		policy,
		isLoading: policyQuery.isLoading,
		isError: policyQuery.isError,
		onRetry: () => policyQuery.refetch(),
		interestType,
		repaymentMethod,
		termMonths,
		onInterestTypeChange: (value) => {
			setDesiredInterestType(value);
			setTermsError(null);
			setHasUnsavedChanges(true);
			clearSubmitError();
		},
		onRepaymentMethodChange: (value) => {
			setDesiredRepaymentMethod(value);
			setTermsError(null);
			setHasUnsavedChanges(true);
			clearSubmitError();
		},
		onTermMonthsChange: (value) => {
			setDesiredTermMonths(value);
			setTermsError(null);
			setHasUnsavedChanges(true);
			clearSubmitError();
		},
		termsError,
		quote: quote ?? null,
		quoteOptions,
		selectedQuoteIndex,
		onSelectQuoteOption: (index, option) => {
			setSelectedQuoteIndex(index);
			setDesiredInterestType(option.interest_type as LoanInterestType);
			setDesiredRepaymentMethod(
				option.repayment_method as LoanRepaymentMethod
			);
			setDesiredTermMonths(option.term_months);
			setTermsError(null);
			setHasUnsavedChanges(true);
			clearSubmitError();
		},
		quoteLoading: quoteQuery.isLoading,
		quoteError: quoteQuery.isError,
		onRetryQuote: () => quoteQuery.refetch(),
	};
}

export function buildMaritalStepProps({
	profileQuery,
	hrMaritalStatus,
	resolvedMaritalConfirmation,
	setMaritalConfirmation,
	setMaritalStatusSnapshot,
	setMaritalError,
	setHasUnsavedChanges,
	clearSubmitError,
	spouseForm,
	handleSaveDraft,
	onBackToLoans,
	maritalError,
	isSaving,
}: MaritalStepArgs): LoanWizardMaritalStepProps {
	return {
		isLoading: profileQuery.isLoading,
		isError: profileQuery.isError,
		onRetry: () => profileQuery.refetch(),
		maritalStatusOnFile: hrMaritalStatus,
		confirmation:
			resolvedMaritalConfirmation === true
				? "yes"
				: resolvedMaritalConfirmation === false
				? "no"
				: null,
		onConfirmYes: () => {
			setMaritalConfirmation(true);
			setMaritalStatusSnapshot(hrMaritalStatus ?? null);
			setMaritalError(null);
			setHasUnsavedChanges(true);
			clearSubmitError();
		},
		onConfirmNo: async () => {
			setMaritalConfirmation(false);
			setMaritalStatusSnapshot(null);
			setMaritalError(null);
			setHasUnsavedChanges(true);
			clearSubmitError();
			spouseForm.reset({
				spouse_first_name: "",
				spouse_last_name: "",
				spouse_email: "",
				spouse_phone: "",
				spouse_address: "",
			});
			const saved = await handleSaveDraft({
				marital_status_snapshot: null,
				spouse_first_name: null,
				spouse_last_name: null,
				spouse_email: null,
				spouse_phone: null,
				spouse_address: null,
			});
			if (!saved) {
				setMaritalError(
					"We couldn't save your draft yet. Please try again."
				);
			}
		},
		onBackToLoans,
		errorMessage: maritalError,
		isSaving,
		children: undefined,
	};
}

export function buildReviewStepProps({
	selectionMode,
	selectionValue,
	sharesToExercise,
	asOfDate,
	quote,
	selectedQuoteOption,
	maritalStatus,
	spouseInfo,
	requiresSpouseInfo,
	submitError,
	submitErrorSection,
	setStepIndex,
	clearSubmitError,
}: ReviewStepArgs): LoanWizardReviewStepProps {
	return {
		selectionMode,
		selectionValue,
		sharesToExercise,
		asOfDate,
		quote,
		selectedQuoteOption,
		maritalStatus,
		spouseInfo,
		requiresSpouseInfo,
		submitError,
		submitErrorSection,
		onEditStep: (step) => {
			clearSubmitError();
			const stepIndexMap: Record<string, number> = {
				exercise: 0,
				terms: 1,
				marital: 2,
			};
			setStepIndex(stepIndexMap[step] ?? 0);
		},
	};
}
