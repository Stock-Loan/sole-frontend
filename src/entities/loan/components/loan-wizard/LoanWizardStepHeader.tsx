import type { LoanWizardStep } from "./types";

interface LoanWizardStepHeaderProps {
	steps: LoanWizardStep[];
	currentStep: LoanWizardStep;
	stepIndex: number;
}

export function LoanWizardStepHeader({
	steps,
	currentStep,
	stepIndex,
}: LoanWizardStepHeaderProps) {
	return (
		<div className="border-b border-border/70 px-6 py-4">
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<h2 className="text-lg font-semibold">{currentStep.title}</h2>
					<p className="text-sm text-muted-foreground">
						{currentStep.description}
					</p>
				</div>
				<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
					{steps.map((step, index) => (
						<div
							key={step.key}
							className="flex items-center gap-2 rounded-full border border-border/70 px-3 py-1"
						>
							<span
								className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold ${
									index <= stepIndex
										? "bg-primary text-primary-foreground"
										: "bg-muted text-muted-foreground"
								}`}
							>
								{index + 1}
							</span>
							<span
								className={
									index === stepIndex
										? "text-foreground"
										: "text-muted-foreground"
								}
							>
								{step.title}
							</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
