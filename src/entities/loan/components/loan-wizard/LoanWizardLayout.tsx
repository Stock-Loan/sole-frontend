import { Button } from "@/shared/ui/Button";
import { AppDialog } from "@/shared/ui/Dialog/dialog";
import { LoanWizardStepHeader } from "./LoanWizardStepHeader";
import type { LoanWizardLayoutProps } from "@/entities/loan/types";

export function LoanWizardLayout({
	steps,
	currentStep,
	stepIndex,
	children,
	onBack,
	onNext,
	backLabel,
	nextLabel,
	nextDisabled = false,
	leaveDialog,
}: LoanWizardLayoutProps) {
	return (
		<>
			<div className="rounded-lg border bg-card shadow-sm">
				<LoanWizardStepHeader
					steps={steps}
					currentStep={currentStep}
					stepIndex={stepIndex}
				/>
				<div className="min-h-[320px] px-6 py-6">{children}</div>
				<div className="flex items-center justify-between border-t border-border/70 px-6 py-4">
					<Button variant="outline" onClick={onBack}>
						{backLabel}
					</Button>
					<Button onClick={onNext} disabled={nextDisabled}>
						{nextLabel}
					</Button>
				</div>
			</div>

			{leaveDialog ? (
				<AppDialog
					open={leaveDialog.open}
					onOpenChange={leaveDialog.onOpenChange}
					title={leaveDialog.title ?? "Discard changes?"}
					description={
						leaveDialog.description ??
						"You have unsaved updates in this loan application. If you leave now, those changes will be lost."
					}
					onCancel={leaveDialog.onCancel}
					actions={[
						{
							label: leaveDialog.confirmLabel ?? "Leave anyway",
							variant: "destructive",
							onClick: leaveDialog.onConfirm,
						},
					]}
				>
					<div />
				</AppDialog>
			) : null}
		</>
	);
}
