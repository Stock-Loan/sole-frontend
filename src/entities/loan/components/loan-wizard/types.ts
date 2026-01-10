export type LoanWizardStepKey = "exercise" | "terms" | "marital" | "review";

export interface LoanWizardStep {
	key: LoanWizardStepKey;
	title: string;
	description: string;
}

export interface LoanWizardOption {
	value: string;
	label: string;
	description: string;
}
