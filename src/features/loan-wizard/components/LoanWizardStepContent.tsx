import { LoanWizardExerciseStep } from "@/entities/loan/components/loan-wizard/LoanWizardExerciseStep";
import { LoanWizardTermsStep } from "@/entities/loan/components/loan-wizard/LoanWizardTermsStep";
import { LoanWizardMaritalStep } from "@/entities/loan/components/loan-wizard/LoanWizardMaritalStep";
import { LoanWizardReviewStep } from "@/entities/loan/components/loan-wizard/LoanWizardReviewStep";
import type { LoanWizardStepContentProps } from "@/features/loan-wizard/types";

export function LoanWizardStepContent({
	stepKey,
	exercise,
	terms,
	marital,
	review,
}: LoanWizardStepContentProps) {
	switch (stepKey) {
		case "exercise":
			return <LoanWizardExerciseStep {...exercise} />;
		case "terms":
			return <LoanWizardTermsStep {...terms} />;
		case "marital":
			return <LoanWizardMaritalStep {...marital} />;
		case "review":
			return <LoanWizardReviewStep {...review} />;
		default:
			return null;
	}
}
