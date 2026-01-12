import { useEffect, useMemo, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { routes } from "@/shared/lib/routes";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { useToast } from "@/shared/ui/use-toast";
import {
	useCreateMyLoanDraft,
	useMyLoanApplication,
	useMyLoanQuote,
	useSubmitMyLoanApplication,
	useUpdateMyLoanDraft,
} from "@/entities/loan/hooks";
import { useMeStockSummary } from "@/entities/stock-grant/hooks";
import type {
	LoanApplicationDraftCreate,
	LoanApplicationDraftUpdate,
	LoanQuoteOption,
	LoanSelectionMode,
	LoanSpouseInfoFormValues,
	ReviewErrorSection,
	UseLoanWizardArgs,
} from "@/entities/loan/types";
import type { LoanWizardState } from "@/entities/loan/types";
import { loanSpouseInfoSchema } from "@/entities/loan/schemas";
import type { LoanInterestType, LoanRepaymentMethod } from "@/entities/org/types";
import { useSelfOrgPolicy } from "@/entities/org/hooks";
import { loanWizardSteps } from "@/entities/loan/components/loan-wizard/constants";
import { LoanWizardSpouseForm } from "@/entities/loan/components/loan-wizard/LoanWizardSpouseForm";
import { extractSubmitError } from "@/entities/loan/components/loan-wizard/utils";
import { formatShares } from "@/entities/stock-grant/constants";
import { useUserSettings } from "@/features/user-settings/hooks";
import { LoanWizardStepContent } from "../components/LoanWizardStepContent";
import { useLoanWizardDerived } from "./useLoanWizardDerived";
import {
	buildExerciseStepProps,
	buildMaritalStepProps,
	buildReviewStepProps,
	buildTermsStepProps,
} from "../lib/buildLoanWizardStepProps";

export function useLoanWizard({ id }: UseLoanWizardArgs): LoanWizardState {
	const navigate = useNavigate();
	const isEdit = Boolean(id);
	const [stepIndex, setStepIndex] = useState(0);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [selectionMode, setSelectionMode] = useState<
		LoanSelectionMode | undefined
	>(undefined);
	const [selectionValue, setSelectionValue] = useState<string | undefined>(
		undefined
	);
	const [selectionError, setSelectionError] = useState<string | null>(null);
	const [desiredInterestType, setDesiredInterestType] = useState<
		LoanInterestType | undefined
	>(undefined);
	const [desiredRepaymentMethod, setDesiredRepaymentMethod] = useState<
		LoanRepaymentMethod | undefined
	>(undefined);
	const [desiredTermMonths, setDesiredTermMonths] = useState<
		number | null | undefined
	>(undefined);
	const [termsError, setTermsError] = useState<string | null>(null);
	const [maritalConfirmation, setMaritalConfirmation] = useState<
		boolean | null
	>(null);
	const [maritalStatusSnapshot, setMaritalStatusSnapshot] = useState<
		string | null | undefined
	>(undefined);
	const [maritalError, setMaritalError] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [submitErrorSection, setSubmitErrorSection] =
		useState<ReviewErrorSection>(null);
	const [createdDraftId, setCreatedDraftId] = useState<string | null>(null);
	const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(0);
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
	const spouseForm = useForm<LoanSpouseInfoFormValues>({
		resolver: zodResolver(loanSpouseInfoSchema),
		defaultValues: {
			spouse_first_name: "",
			spouse_last_name: "",
			spouse_email: "",
			spouse_phone: "",
			spouse_address: "",
		},
	});

	const clearSubmitError = () => {
		if (submitError || submitErrorSection) {
			setSubmitError(null);
			setSubmitErrorSection(null);
		}
	};

	const loanQuery = useMyLoanApplication(id ?? "", { enabled: isEdit });
	const summaryQuery = useMeStockSummary();
	const policyQuery = useSelfOrgPolicy({ enabled: stepIndex >= 1 });
	const profileQuery = useUserSettings({ enabled: stepIndex >= 2 });
	const createDraftMutation = useCreateMyLoanDraft({
		onSuccess: (draft) => {
			setCreatedDraftId(draft.id);
			setHasUnsavedChanges(false);
			toast({ title: "Draft saved" });
		},
		onError: (error) => apiErrorToast(error, "Unable to save draft."),
	});
	const updateDraftMutation = useUpdateMyLoanDraft({
		onSuccess: () => {
			setHasUnsavedChanges(false);
			toast({ title: "Draft updated" });
		},
		onError: (error) => apiErrorToast(error, "Unable to save draft."),
	});
	const submitMutation = useSubmitMyLoanApplication({
		onSuccess: () => {
			toast({ title: "Application submitted" });
			navigate(routes.workspaceLoans);
		},
		onError: (error) => {
			const { message, section } = extractSubmitError(error);
			setSubmitError(message);
			setSubmitErrorSection(section);
		},
	});

	const policy = policyQuery.data;
	const draft = loanQuery.data;
	const summary = summaryQuery.data;
	const hrMaritalStatus = profileQuery.data?.user?.marital_status ?? null;
	const eligibility = summary?.eligibility_result;

	const {
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
	} = useLoanWizardDerived({
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
	});

	const effectiveDraftId = createdDraftId ?? draft?.id ?? null;
	const spouseDefaults = useMemo(
		() => ({
			spouse_first_name: draft?.spouse_first_name ?? "",
			spouse_last_name: draft?.spouse_last_name ?? "",
			spouse_email: draft?.spouse_email ?? "",
			spouse_phone: draft?.spouse_phone ?? "",
			spouse_address: draft?.spouse_address ?? "",
		}),
		[
			draft?.spouse_first_name,
			draft?.spouse_last_name,
			draft?.spouse_email,
			draft?.spouse_phone,
			draft?.spouse_address,
		]
	);

	const blocker = useBlocker(hasUnsavedChanges);
	const showLeaveDialog = blocker?.state === "blocked";

	useEffect(() => {
		if (!hasUnsavedChanges) return;
		const handler = (event: BeforeUnloadEvent) => {
			event.preventDefault();
			event.returnValue = "";
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [hasUnsavedChanges]);

	useEffect(() => {
		spouseForm.reset(spouseDefaults);
	}, [spouseDefaults, spouseForm]);

	const currentStep = loanWizardSteps[stepIndex];
	const isFirstStep = stepIndex === 0;
	const isLastStep = stepIndex === loanWizardSteps.length - 1;
	const isReviewStep = currentStep.key === "review";

	const quoteInput = useMemo(() => {
		if (!selectionValueValid || !selectionWithinLimit) return null;
		if (!interestTypeValid || !repaymentMethodValid || !termValid) return null;
		return {
			selection_mode: resolvedSelectionMode,
			selection_value: resolvedSelectionValue,
			as_of_date: resolvedAsOfDate,
			desired_interest_type: resolvedInterestType ?? undefined,
			desired_repayment_method: resolvedRepaymentMethod ?? undefined,
			desired_term_months: resolvedTermMonths ?? undefined,
		};
	}, [
		selectionValueValid,
		selectionWithinLimit,
		interestTypeValid,
		repaymentMethodValid,
		termValid,
		resolvedSelectionMode,
		resolvedSelectionValue,
		resolvedAsOfDate,
		resolvedInterestType,
		resolvedRepaymentMethod,
		resolvedTermMonths,
	]);

	const quoteQuery = useMyLoanQuote(quoteInput, {
		enabled: currentStep.key === "terms" && Boolean(quoteInput),
	});
	const quote = quoteQuery.data;
	const quoteOptions = quote?.options ?? [];
	const safeSelectedQuoteIndex =
		selectedQuoteIndex < quoteOptions.length ? selectedQuoteIndex : 0;
	const selectedQuoteOption: LoanQuoteOption | null =
		quoteOptions[safeSelectedQuoteIndex] ?? quoteOptions[0] ?? null;
	const canProceedFromStep2 =
		Boolean(policy) &&
		interestTypeValid &&
		repaymentMethodValid &&
		termValid &&
		Boolean(quote) &&
		Boolean(selectedQuoteOption);
	const canProceedFromStep3 = resolvedMaritalConfirmation === true;
	const spouseSummary = requiresSpouseInfo ? spouseForm.getValues() : null;
	const canSubmit =
		Boolean(effectiveDraftId) && canProceedFromStep2 && canProceedFromStep3;

	const handleBack = () => {
		if (isFirstStep) {
			navigate(routes.workspaceLoans);
			return;
		}
		setStepIndex((prev) => Math.max(0, prev - 1));
	};

	const handleSaveDraft = async (
		overrides?: Partial<LoanApplicationDraftUpdate>
	) => {
		if (!quoteInput || !selectionValueValid || !selectionWithinLimit) {
			setTermsError("Complete Step 1 selections before saving.");
			return false;
		}
		if (!interestTypeValid || !repaymentMethodValid || !termValid) {
			setTermsError(
				"Select interest type, repayment method, and a valid term."
			);
			return false;
		}
		setTermsError(null);

		const payloadInterestType =
			selectedQuoteOption?.interest_type ?? resolvedInterestType ?? undefined;
		const payloadRepaymentMethod =
			selectedQuoteOption?.repayment_method ??
			resolvedRepaymentMethod ??
			undefined;
		const payloadTermMonths =
			selectedQuoteOption?.term_months ?? resolvedTermMonths ?? undefined;

		const basePayload: LoanApplicationDraftCreate = {
			selection_mode: resolvedSelectionMode,
			selection_value: resolvedSelectionValue,
			as_of_date: resolvedAsOfDate,
			desired_interest_type: payloadInterestType,
			desired_repayment_method: payloadRepaymentMethod,
			desired_term_months: payloadTermMonths,
		};
		const payload = mergeDraftOverrides(basePayload, overrides);

		if (effectiveDraftId) {
			await updateDraftMutation.mutateAsync({
				id: effectiveDraftId,
				payload,
			});
			return true;
		}

		await createDraftMutation.mutateAsync(payload);
		return true;
	};

	const handleNext = async () => {
		if (currentStep.key === "exercise") {
			if (!summary) {
				setSelectionError("Stock summary is required to continue.");
				return;
			}
			if (!eligibility?.eligible_to_exercise) {
				setSelectionError("You are not eligible to exercise shares.");
				return;
			}
			if (!selectionValueValid) {
				setSelectionError(
					resolvedSelectionMode === "PERCENT"
						? "Enter a valid percentage."
						: "Enter a valid number of shares."
				);
				return;
			}
			if (!selectionWithinLimit) {
				if (resolvedSelectionMode === "PERCENT") {
					setSelectionError("Percent cannot exceed 100%.");
					return;
				}

				const numericValue = Number(resolvedSelectionValue);
				const availableShares =
					totalAvailableVestedShares ?? totalExercisableShares;
				setSelectionError(
					`You entered ${formatShares(Math.floor(numericValue))} shares, but only ${formatShares(
						availableShares
					)} are available to exercise.`
				);
				return;
			}
			setSelectionError(null);
		}
		if (currentStep.key === "terms") {
			const saved = await handleSaveDraft();
			if (!saved) {
				return;
			}
		}
		if (currentStep.key === "marital") {
			if (resolvedMaritalConfirmation !== true) {
				setMaritalError("Please confirm your marital status to continue.");
				return;
			}
			if (requiresSpouseInfo) {
				const isValid = await spouseForm.trigger();
				if (!isValid) {
					setMaritalError(
						"Please complete all required spouse/partner details."
					);
					return;
				}
			}
			const spouseValues = spouseForm.getValues();
			const saved = await handleSaveDraft({
				marital_status_snapshot:
					resolvedMaritalSnapshot ?? hrMaritalStatus ?? null,
				spouse_first_name: requiresSpouseInfo
					? spouseValues.spouse_first_name
					: null,
				spouse_last_name: requiresSpouseInfo
					? spouseValues.spouse_last_name
					: null,
				spouse_email: requiresSpouseInfo ? spouseValues.spouse_email : null,
				spouse_phone: requiresSpouseInfo ? spouseValues.spouse_phone : null,
				spouse_address: requiresSpouseInfo ? spouseValues.spouse_address : null,
			});
			if (!saved) {
				return;
			}
			setMaritalError(null);
		}
		if (isLastStep) {
			return;
		}
		setStepIndex((prev) => Math.min(loanWizardSteps.length - 1, prev + 1));
	};

	const handleSubmitApplication = async () => {
		if (!effectiveDraftId) {
			setSubmitError(
				"We couldn't find a saved draft to submit. Please save your draft and try again."
			);
			setSubmitErrorSection("terms");
			return;
		}
		setSubmitError(null);
		setSubmitErrorSection(null);
		try {
			await submitMutation.mutateAsync(effectiveDraftId);
		} catch {
			// errors are surfaced via mutation onError handler
		}
	};

	const handleLeave = () => {
		blocker?.proceed?.();
	};

	const handleStay = () => {
		blocker?.reset?.();
	};

	const exerciseProps = buildExerciseStepProps({
		summaryQuery,
		hasSummary: Boolean(summary),
		selectionMode: resolvedSelectionMode,
		selectionValue: resolvedSelectionValue,
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
	});

	const termsProps = buildTermsStepProps({
		policyQuery,
		policy,
		interestType: resolvedInterestType,
		repaymentMethod: resolvedRepaymentMethod,
		termMonths: resolvedTermMonths ?? null,
		setDesiredInterestType,
		setDesiredRepaymentMethod,
		setDesiredTermMonths,
		setTermsError,
		setSelectedQuoteIndex,
		setHasUnsavedChanges,
		clearSubmitError,
		termsError,
		quote: quote ?? null,
		quoteOptions,
		selectedQuoteIndex: safeSelectedQuoteIndex,
		quoteQuery,
	});

	const isSaving = createDraftMutation.isPending || updateDraftMutation.isPending;
	const maritalPropsBase = buildMaritalStepProps({
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
		onBackToLoans: () => navigate(routes.workspaceLoans),
		maritalError,
		isSaving,
	});
	const maritalProps = {
		...maritalPropsBase,
		children:
			resolvedMaritalConfirmation === true && requiresSpouseInfo ? (
				<div className="mt-6">
					<LoanWizardSpouseForm
						form={spouseForm}
						disabled={isSaving}
						onFieldChange={() => {
							setMaritalError(null);
							setHasUnsavedChanges(true);
							clearSubmitError();
						}}
					/>
				</div>
			) : null,
	};

	const reviewProps = buildReviewStepProps({
		selectionMode: resolvedSelectionMode,
		selectionValue: resolvedSelectionValue,
		sharesToExercise,
		asOfDate: resolvedAsOfDate,
		quote: quote ?? null,
		selectedQuoteOption,
		maritalStatus: resolvedMaritalSnapshot ?? hrMaritalStatus ?? null,
		spouseInfo: spouseSummary,
		requiresSpouseInfo,
		submitError,
		submitErrorSection,
		setStepIndex,
		clearSubmitError,
	});

	const content = (
		<LoanWizardStepContent
			stepKey={currentStep.key}
			exercise={exerciseProps}
			terms={termsProps}
			marital={maritalProps}
			review={reviewProps}
		/>
	);

	const nextLabel = isReviewStep
		? "Submit application"
		: isLastStep
		? "Done"
		: "Next";
	const nextDisabled =
		(isReviewStep && !canSubmit) ||
		(!isReviewStep &&
			((currentStep.key === "exercise" && !canProceedFromStep1) ||
				(currentStep.key === "terms" && !canProceedFromStep2) ||
				(currentStep.key === "marital" && !canProceedFromStep3))) ||
		createDraftMutation.isPending ||
		updateDraftMutation.isPending ||
		submitMutation.isPending;

	const draftLoading = isEdit && loanQuery.isLoading;
	const draftError = isEdit && loanQuery.isError;
	const draftLocked =
		isEdit && loanQuery.data && loanQuery.data.status !== "DRAFT";

	if (draftLoading) {
		return { draftState: "loading" };
	}

	if (draftError) {
		return { draftState: "error", onRetryDraft: () => loanQuery.refetch() };
	}

	if (draftLocked) {
		return {
			draftState: "locked",
			onViewDraft: () =>
				navigate(routes.workspaceLoanDetail.replace(":id", loanQuery.data!.id)),
		};
	}

	return {
		draftState: "ready",
		layout: {
			steps: loanWizardSteps,
			currentStep,
			stepIndex,
			content,
			backLabel: isFirstStep ? "Back to loans" : "Back",
			nextLabel,
			nextDisabled,
			onBack: handleBack,
			onNext: isReviewStep ? handleSubmitApplication : handleNext,
			leaveDialog: {
				open: showLeaveDialog,
				onOpenChange: (open) => {
					if (!open) {
						blocker?.reset?.();
					}
				},
				onCancel: handleStay,
				onConfirm: handleLeave,
			},
		},
	};
}

function mergeDraftOverrides(
	base: LoanApplicationDraftCreate,
	overrides?: Partial<LoanApplicationDraftUpdate>
): LoanApplicationDraftCreate {
	if (!overrides) return base;
	const merged: LoanApplicationDraftCreate = { ...base };
	const setIfDefined = <K extends keyof LoanApplicationDraftCreate>(
		key: K,
		value: LoanApplicationDraftCreate[K] | undefined
	) => {
		if (value !== undefined) {
			merged[key] = value;
		}
	};

	setIfDefined("selection_mode", overrides.selection_mode);
	setIfDefined("selection_value", overrides.selection_value);
	setIfDefined("as_of_date", overrides.as_of_date);
	setIfDefined("desired_interest_type", overrides.desired_interest_type);
	setIfDefined("desired_repayment_method", overrides.desired_repayment_method);
	setIfDefined("desired_term_months", overrides.desired_term_months);
	setIfDefined("marital_status_snapshot", overrides.marital_status_snapshot);
	setIfDefined("spouse_first_name", overrides.spouse_first_name);
	setIfDefined("spouse_last_name", overrides.spouse_last_name);
	setIfDefined("spouse_email", overrides.spouse_email);
	setIfDefined("spouse_phone", overrides.spouse_phone);
	setIfDefined("spouse_address", overrides.spouse_address);

	return merged;
}
