import { useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { LoanWizardLayout } from "@/entities/loan/components/loan-wizard/LoanWizardLayout";
import { useLoanWizard } from "@/features/loan-wizard/hooks/useLoanWizard";

export function LoanWizardPage() {
	const { id } = useParams();
	const wizard = useLoanWizard({ id });

	if (wizard.draftState === "loading") {
		return (
			<PageContainer>
				<LoadingState label="Loading loan draft..." />
			</PageContainer>
		);
	}

	if (wizard.draftState === "error") {
		return (
			<PageContainer>
				<EmptyState
					title="Unable to load draft"
					message="We couldn't load this loan draft. Please try again."
					actionLabel="Retry"
					onRetry={wizard.onRetryDraft}
				/>
			</PageContainer>
		);
	}

	if (wizard.draftState === "locked") {
		return (
			<PageContainer>
				<EmptyState
					title="Draft is no longer editable"
					message="Only draft loan applications can be edited."
					actionLabel="View application"
					onRetry={wizard.onViewDraft}
				/>
			</PageContainer>
		);
	}

	if (!wizard.layout) {
		return null;
	}

	const { content, ...layoutProps } = wizard.layout;

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-6" fullHeight>
			<PageHeader
				title="Loan application"
				subtitle="Build and submit your stock exercise loan request."
			/>

			<LoanWizardLayout {...layoutProps}>{content}</LoanWizardLayout>
		</PageContainer>
	);
}
