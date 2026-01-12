import type { UseFormReturn } from "react-hook-form";
import type {
	LoanApplication,
	LoanApplicationDraftUpdate,
	LoanQuoteOption,
	LoanQuoteResponse,
	LoanSelectionMode,
	LoanSpouseInfoFormValues,
	LoanWizardExerciseStepProps,
	LoanWizardMaritalStepProps,
	LoanWizardReviewStepProps,
	LoanWizardStep,
	LoanWizardTermsStepProps,
	ReviewErrorSection,
} from "@/entities/loan/types";
import type {
	LoanInterestType,
	LoanRepaymentMethod,
	SelfOrgPolicy,
} from "@/entities/org/types";
import type { StockSummary } from "@/entities/stock-grant/types";

export interface LoanWizardStepContentProps {
	stepKey: LoanWizardStep["key"];
	exercise: LoanWizardExerciseStepProps;
	terms: LoanWizardTermsStepProps;
	marital: LoanWizardMaritalStepProps;
	review: LoanWizardReviewStepProps;
}

export interface QueryState {
	isLoading: boolean;
	isError: boolean;
	refetch: () => Promise<unknown>;
}

export interface ExerciseStepArgs {
	summaryQuery: QueryState;
	hasSummary: boolean;
	selectionMode: LoanSelectionMode;
	selectionValue: string;
	selectionError: string | null;
	setSelectionMode: (mode: LoanSelectionMode) => void;
	setSelectionValue: (value: string) => void;
	setSelectionError: (value: string | null) => void;
	setHasUnsavedChanges: (value: boolean) => void;
	clearSubmitError: () => void;
	totalExercisableShares: number;
	totalVestedShares?: number | null;
	totalReservedShares?: number | null;
	totalAvailableVestedShares?: number | null;
	sharesToExercise: number;
	estimatedPurchasePrice: number | null;
}

export interface TermsStepArgs {
	policyQuery: QueryState;
	policy: SelfOrgPolicy | null | undefined;
	interestType: LoanInterestType | null;
	repaymentMethod: LoanRepaymentMethod | null;
	termMonths: number | null;
	setDesiredInterestType: (value: LoanInterestType) => void;
	setDesiredRepaymentMethod: (value: LoanRepaymentMethod) => void;
	setDesiredTermMonths: (value: number | null) => void;
	setTermsError: (value: string | null) => void;
	setSelectedQuoteIndex: (value: number) => void;
	setHasUnsavedChanges: (value: boolean) => void;
	clearSubmitError: () => void;
	termsError: string | null;
	quote: LoanQuoteResponse | null;
	quoteOptions: LoanQuoteOption[];
	selectedQuoteIndex: number;
	quoteQuery: QueryState;
}

export interface MaritalStepArgs {
	profileQuery: QueryState;
	hrMaritalStatus: string | null;
	resolvedMaritalConfirmation: boolean | null;
	setMaritalConfirmation: (value: boolean | null) => void;
	setMaritalStatusSnapshot: (value: string | null) => void;
	setMaritalError: (value: string | null) => void;
	setHasUnsavedChanges: (value: boolean) => void;
	clearSubmitError: () => void;
	spouseForm: UseFormReturn<LoanSpouseInfoFormValues>;
	handleSaveDraft: (
		overrides?: Partial<LoanApplicationDraftUpdate>
	) => Promise<boolean>;
	onBackToLoans: () => void;
	maritalError: string | null;
	isSaving: boolean;
}

export interface ReviewStepArgs {
	selectionMode: LoanSelectionMode;
	selectionValue: string;
	sharesToExercise: number;
	asOfDate: string;
	quote: LoanQuoteResponse | null;
	selectedQuoteOption: LoanQuoteOption | null;
	maritalStatus: string | null;
	spouseInfo: LoanSpouseInfoFormValues | null;
	requiresSpouseInfo: boolean;
	submitError: string | null;
	submitErrorSection: ReviewErrorSection;
	setStepIndex: (value: number) => void;
	clearSubmitError: () => void;
}

export interface UseLoanWizardDerivedArgs {
	selectionMode: LoanSelectionMode | undefined;
	selectionValue: string | undefined;
	desiredInterestType: LoanInterestType | undefined;
	desiredRepaymentMethod: LoanRepaymentMethod | undefined;
	desiredTermMonths: number | null | undefined;
	maritalConfirmation: boolean | null;
	maritalStatusSnapshot: string | null | undefined;
	draft: LoanApplication | null | undefined;
	policy: SelfOrgPolicy | null | undefined;
	summary: StockSummary | null | undefined;
	hrMaritalStatus: string | null;
	todayIso: string;
}

export interface LoanWizardDerivedState {
	resolvedSelectionMode: LoanSelectionMode;
	resolvedSelectionValue: string;
	resolvedAsOfDate: string;
	resolvedInterestType: LoanInterestType | null;
	resolvedRepaymentMethod: LoanRepaymentMethod | null;
	resolvedTermMonths: number | null;
	selectionValueValid: boolean;
	selectionWithinLimit: boolean;
	sharesToExercise: number;
	estimatedPurchasePrice: number | null;
	totalExercisableShares: number;
	totalVestedShares: number | null;
	totalReservedShares: number | null;
	totalAvailableVestedShares: number | null;
	canProceedFromStep1: boolean;
	interestTypeValid: boolean;
	repaymentMethodValid: boolean;
	termValid: boolean;
	resolvedMaritalSnapshot: string | null;
	resolvedMaritalConfirmation: boolean | null;
	requiresSpouseInfo: boolean;
}
export interface UseLoanWizardDerivedArgs {
	selectionMode: LoanSelectionMode | undefined;
	selectionValue: string | undefined;
	desiredInterestType: LoanInterestType | undefined;
	desiredRepaymentMethod: LoanRepaymentMethod | undefined;
	desiredTermMonths: number | null | undefined;
	maritalConfirmation: boolean | null;
	maritalStatusSnapshot: string | null | undefined;
	draft: LoanApplication | null | undefined;
	policy: SelfOrgPolicy | null | undefined;
	summary: StockSummary | null | undefined;
	hrMaritalStatus: string | null;
	todayIso: string;
}
export interface LoanWizardDerivedState {
	resolvedSelectionMode: LoanSelectionMode;
	resolvedSelectionValue: string;
	resolvedAsOfDate: string;
	resolvedInterestType: LoanInterestType | null;
	resolvedRepaymentMethod: LoanRepaymentMethod | null;
	resolvedTermMonths: number | null;
	selectionValueValid: boolean;
	selectionWithinLimit: boolean;
	sharesToExercise: number;
	estimatedPurchasePrice: number | null;
	totalExercisableShares: number;
	canProceedFromStep1: boolean;
	interestTypeValid: boolean;
	repaymentMethodValid: boolean;
	termValid: boolean;
	resolvedMaritalSnapshot: string | null;
	resolvedMaritalConfirmation: boolean | null;
	requiresSpouseInfo: boolean;
}
