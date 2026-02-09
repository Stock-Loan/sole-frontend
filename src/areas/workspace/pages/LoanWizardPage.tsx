import { useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { LoanWizardLayout } from "@/entities/loan/components/loan-wizard/LoanWizardLayout";
import { loanWizardSteps } from "@/entities/loan/constants";
import { useLoanWizard } from "@/features/loan-wizard/hooks/useLoanWizard";

export function LoanWizardPage() {
	const { id } = useParams();
	const wizard = useLoanWizard({ id });

	if (wizard.draftState === "loading") {
		return <LoanWizardLoadingSkeleton />;
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

function LoanWizardLoadingSkeleton() {
	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-6" fullHeight>
			<PageHeader
				title="Loan application"
				subtitle="Build and submit your stock exercise loan request."
			/>

			<LoanWizardLayout
				steps={loanWizardSteps}
				currentStep={loanWizardSteps[0]}
				stepIndex={0}
				backLabel="Back"
				nextLabel="Continue"
				nextDisabled
				onBack={() => undefined}
				onNext={() => undefined}
			>
				<div className="space-y-6">
					<div className="rounded-lg border border-border/70 p-5">
						<Skeleton className="h-4 w-40" />
						<Skeleton className="mt-3 h-3 w-72" />
						<div className="mt-5 grid gap-4 md:grid-cols-2">
							<div className="space-y-2">
								<Skeleton className="h-3 w-28" />
								<Skeleton className="h-10 w-full" />
							</div>
							<div className="space-y-2">
								<Skeleton className="h-3 w-36" />
								<Skeleton className="h-10 w-full" />
							</div>
						</div>
					</div>

					<div className="rounded-lg border border-border/70 p-5">
						<Skeleton className="h-4 w-52" />
						<Skeleton className="mt-3 h-3 w-64" />
						<div className="mt-4 space-y-3">
							<Skeleton className="h-3 w-full" />
							<Skeleton className="h-3 w-[88%]" />
							<Skeleton className="h-2 w-full rounded-full" />
						</div>
					</div>
				</div>
			</LoanWizardLayout>
		</PageContainer>
	);
}
