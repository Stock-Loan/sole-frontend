import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { cn } from "@/shared/lib/utils";

type MaritalConfirmation = "yes" | "no" | null;

interface LoanWizardMaritalStepProps {
	isLoading: boolean;
	isError: boolean;
	onRetry: () => void;
	maritalStatusOnFile: string | null;
	confirmation: MaritalConfirmation;
	onConfirmYes: () => void;
	onConfirmNo: () => void;
	onBackToLoans: () => void;
	errorMessage: string | null;
	isSaving: boolean;
}

export function LoanWizardMaritalStep({
	isLoading,
	isError,
	onRetry,
	maritalStatusOnFile,
	confirmation,
	onConfirmYes,
	onConfirmNo,
	onBackToLoans,
	errorMessage,
	isSaving,
}: LoanWizardMaritalStepProps) {
	if (isLoading) {
		return <LoadingState label="Loading profile..." />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load profile"
				message="We couldn't load your profile details to confirm marital status."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	const statusLabel = maritalStatusOnFile ?? "Not provided";

	return (
		<div className="space-y-6">
			<div className="rounded-lg border border-border/70 p-4 shadow-sm">
				<p className="text-sm font-semibold text-foreground">
					Marital status on file (HR record)
				</p>
				<p className="mt-1 text-sm text-muted-foreground">{statusLabel}</p>
				<p className="mt-3 text-sm text-muted-foreground">
					Please confirm this information is accurate before continuing.
				</p>

				<div className="mt-4 grid gap-3 md:grid-cols-2">
					<button
						type="button"
						onClick={onConfirmYes}
						disabled={isSaving}
						className={cn(
							"flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
							confirmation === "yes"
								? "border-primary bg-primary/5"
								: "border-border/70 hover:border-primary/50"
						)}
					>
						<span
							className={cn(
								"mt-1 h-2.5 w-2.5 rounded-full border",
								confirmation === "yes"
									? "border-primary bg-primary"
									: "border-muted-foreground/40"
							)}
						/>
						<div>
							<p className="font-medium text-foreground">Yes, it is correct</p>
							<p className="text-xs text-muted-foreground">
								Continue to provide spousal details if required.
							</p>
						</div>
					</button>
					<button
						type="button"
						onClick={onConfirmNo}
						disabled={isSaving}
						className={cn(
							"flex w-full items-start gap-3 rounded-lg border px-4 py-3 text-left text-sm transition",
							confirmation === "no"
								? "border-destructive bg-destructive/5"
								: "border-border/70 hover:border-destructive/40"
						)}
					>
						<span
							className={cn(
								"mt-1 h-2.5 w-2.5 rounded-full border",
								confirmation === "no"
									? "border-destructive bg-destructive"
									: "border-muted-foreground/40"
							)}
						/>
						<div>
							<p className="font-medium text-foreground">
								No, it needs updating
							</p>
							<p className="text-xs text-muted-foreground">
								We will save this as a draft and pause the application.
							</p>
						</div>
					</button>
				</div>

				{errorMessage ? (
					<p className="mt-3 text-sm text-destructive">{errorMessage}</p>
				) : null}
			</div>

			{confirmation === "no" ? (
				<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm">
					<p className="font-semibold text-foreground">
						We saved your application as a draft.
					</p>
					<p className="mt-2 text-muted-foreground">
						Please contact HR to update your marital status, then return to
						continue from this step.
					</p>
					<div className="mt-4">
						<Button variant="outline" onClick={onBackToLoans}>
							Back to My Loans
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
