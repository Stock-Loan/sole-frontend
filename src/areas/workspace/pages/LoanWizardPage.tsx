import { useEffect, useMemo, useState } from "react";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Button } from "@/shared/ui/Button";
import { AppDialog } from "@/shared/ui/Dialog/dialog";
import { routes } from "@/shared/lib/routes";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { useToast } from "@/shared/ui/use-toast";
import {
	useCreateMyLoanDraft,
	useMyLoanApplication,
	useMyLoanQuote,
	useUpdateMyLoanDraft,
} from "@/entities/loan/hooks";
import { useMeStockSummary } from "@/entities/stock-grant/hooks";
import { getStockValueMetrics } from "@/entities/stock-grant/utils";
import type { LoanQuoteOption, LoanSelectionMode } from "@/entities/loan/types";
import type {
	LoanInterestType,
	LoanRepaymentMethod,
} from "@/entities/org/types";
import { useSelfOrgPolicy } from "@/entities/org/hooks";
import { loanWizardSteps } from "@/entities/loan/components/loan-wizard/constants";
import { LoanWizardStepHeader } from "@/entities/loan/components/loan-wizard/LoanWizardStepHeader";
import { LoanWizardExerciseStep } from "@/entities/loan/components/loan-wizard/LoanWizardExerciseStep";
import { LoanWizardTermsStep } from "@/entities/loan/components/loan-wizard/LoanWizardTermsStep";

export function LoanWizardPage() {
	const navigate = useNavigate();
	const { id } = useParams();
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
	const [createdDraftId, setCreatedDraftId] = useState<string | null>(null);
	const [selectedQuoteIndex, setSelectedQuoteIndex] = useState(0);
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);

	const loanQuery = useMyLoanApplication(id ?? "", { enabled: isEdit });
	const summaryQuery = useMeStockSummary();
	const policyQuery = useSelfOrgPolicy({ enabled: stepIndex >= 1 });
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

	const policy = policyQuery.data;

	const draft = loanQuery.data;
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

	const resolvedSelectionMode = selectionMode ?? draftSelectionMode ?? "SHARES";
	const resolvedSelectionValue =
		selectionValue !== undefined ? selectionValue : draftSelectionValue ?? "";
	const resolvedAsOfDate = draft?.as_of_date ?? todayIso;
	const resolvedInterestType = (() => {
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
	})();
	const resolvedRepaymentMethod = (() => {
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
	})();
	const resolvedTermMonths = (() => {
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
	})();
	const effectiveDraftId = createdDraftId ?? draft?.id ?? null;

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

	const currentStep = loanWizardSteps[stepIndex];
	const isFirstStep = stepIndex === 0;
	const isLastStep = stepIndex === loanWizardSteps.length - 1;
	const summary = summaryQuery.data;
	const eligibility = summary?.eligibility_result;
	const totalExercisableShares =
		eligibility?.total_vested_shares ?? summary?.total_vested_shares ?? 0;
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
	const interestTypeValid =
		Boolean(policy) &&
		resolvedInterestType !== null &&
		policy?.allowed_interest_types.includes(resolvedInterestType);
	const repaymentMethodValid =
		Boolean(policy) &&
		resolvedRepaymentMethod !== null &&
		policy?.allowed_repayment_methods.includes(resolvedRepaymentMethod);
	const termValid =
		Boolean(policy) &&
		typeof resolvedTermMonths === "number" &&
		resolvedTermMonths >= (policy?.min_loan_term_months ?? 0) &&
		resolvedTermMonths <= (policy?.max_loan_term_months ?? 0);

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

	const handleBack = () => {
		if (isFirstStep) {
			navigate(routes.workspaceLoans);
			return;
		}
		setStepIndex((prev) => Math.max(0, prev - 1));
	};

	const handleSaveDraft = async () => {
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

		const payload = {
			selection_mode: resolvedSelectionMode,
			selection_value: resolvedSelectionValue,
			as_of_date: resolvedAsOfDate,
			desired_interest_type: payloadInterestType,
			desired_repayment_method: payloadRepaymentMethod,
			desired_term_months: payloadTermMonths,
		};

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
				setSelectionError(
					resolvedSelectionMode === "PERCENT"
						? "Percent must be 100 or less."
						: "Shares must be within available exercisable shares."
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
		if (isLastStep) {
			return;
		}
		setStepIndex((prev) => Math.min(loanWizardSteps.length - 1, prev + 1));
	};

	const handleLeave = () => {
		blocker?.proceed?.();
	};

	const handleStay = () => {
		blocker?.reset?.();
	};

	const renderStep = () => {
		switch (currentStep.key) {
			case "exercise":
				return (
					<LoanWizardExerciseStep
						isLoading={summaryQuery.isLoading}
						isError={summaryQuery.isError}
						onRetry={() => summaryQuery.refetch()}
						hasSummary={Boolean(summary)}
						selectionMode={resolvedSelectionMode}
						selectionValue={resolvedSelectionValue}
						selectionError={selectionError}
						onSelectionModeChange={(mode) => {
							setSelectionMode(mode);
							setSelectionValue("");
							setSelectionError(null);
							setHasUnsavedChanges(true);
						}}
						onSelectionValueChange={(value) => {
							setSelectionValue(value);
							setSelectionError(null);
							setHasUnsavedChanges(true);
						}}
						totalExercisableShares={totalExercisableShares}
						sharesToExercise={sharesToExercise}
						estimatedPurchasePrice={estimatedPurchasePrice}
					/>
				);
			case "terms":
				return (
					<LoanWizardTermsStep
						policy={policy}
						isLoading={policyQuery.isLoading}
						isError={policyQuery.isError}
						onRetry={() => policyQuery.refetch()}
						interestType={resolvedInterestType}
						repaymentMethod={resolvedRepaymentMethod}
						termMonths={resolvedTermMonths ?? null}
						onInterestTypeChange={(value) => {
							setDesiredInterestType(value);
							setTermsError(null);
							setHasUnsavedChanges(true);
						}}
						onRepaymentMethodChange={(value) => {
							setDesiredRepaymentMethod(value);
							setTermsError(null);
							setHasUnsavedChanges(true);
						}}
						onTermMonthsChange={(value) => {
							setDesiredTermMonths(value);
							setTermsError(null);
							setHasUnsavedChanges(true);
						}}
						termsError={termsError}
						quote={quote ?? null}
						quoteOptions={quoteOptions}
						selectedQuoteIndex={safeSelectedQuoteIndex}
						onSelectQuoteOption={(index, option) => {
							setSelectedQuoteIndex(index);
							setDesiredInterestType(option.interest_type as LoanInterestType);
							setDesiredRepaymentMethod(
								option.repayment_method as LoanRepaymentMethod
							);
							setDesiredTermMonths(option.term_months);
							setTermsError(null);
							setHasUnsavedChanges(true);
						}}
						quoteLoading={quoteQuery.isLoading}
						quoteError={quoteQuery.isError}
						onRetryQuote={() => quoteQuery.refetch()}
					/>
				);
			case "marital":
				return (
					<EmptyState
						title="Step 3 coming soon"
						message="Marital status confirmation will be available in Phase F6.3."
					/>
				);
			case "review":
				return (
					<EmptyState
						title="Step 4 coming soon"
						message="Final review and submission will be available in Phase F6.3."
					/>
				);
			default:
				return null;
		}
	};

	if (isEdit && loanQuery.isLoading) {
		return (
			<PageContainer>
				<LoadingState label="Loading loan draft..." />
			</PageContainer>
		);
	}

	if (isEdit && loanQuery.isError) {
		return (
			<PageContainer>
				<EmptyState
					title="Unable to load draft"
					message="We couldn't load this loan draft. Please try again."
					actionLabel="Retry"
					onRetry={() => loanQuery.refetch()}
				/>
			</PageContainer>
		);
	}

	if (isEdit && loanQuery.data && loanQuery.data.status !== "DRAFT") {
		return (
			<PageContainer>
				<EmptyState
					title="Draft is no longer editable"
					message="Only draft loan applications can be edited."
					actionLabel="View application"
					onRetry={() =>
						navigate(
							routes.workspaceLoanDetail.replace(":id", loanQuery.data!.id)
						)
					}
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan application"
				subtitle="Build and submit your stock exercise loan request."
			/>

			<div className="rounded-lg border bg-card shadow-sm">
				<LoanWizardStepHeader
					steps={loanWizardSteps}
					currentStep={currentStep}
					stepIndex={stepIndex}
				/>
				<div className="min-h-[320px] px-6 py-6">{renderStep()}</div>
				<div className="flex items-center justify-between border-t border-border/70 px-6 py-4">
					<Button variant="outline" onClick={handleBack}>
						{isFirstStep ? "Back to loans" : "Back"}
					</Button>
					<Button
						onClick={handleNext}
						disabled={
							isLastStep ||
							(currentStep.key === "exercise" && !canProceedFromStep1) ||
							(currentStep.key === "terms" && !canProceedFromStep2) ||
							createDraftMutation.isPending ||
							updateDraftMutation.isPending
						}
					>
						{isLastStep ? "Done" : "Next"}
					</Button>
				</div>
			</div>

			<AppDialog
				open={showLeaveDialog}
				onOpenChange={(open) => {
					if (!open) {
						blocker?.reset?.();
					}
				}}
				title="Discard changes?"
				description="You have unsaved updates in this loan application. If you leave now, those changes will be lost."
				onCancel={handleStay}
				actions={[
					{
						label: "Leave anyway",
						variant: "destructive",
						onClick: handleLeave,
					},
				]}
			>
				<div />
			</AppDialog>
		</PageContainer>
	);
}
