import { Calendar, CheckCircle2, Clock } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { cn, normalizeDisplay } from "@/shared/lib/utils";
import { formatDate } from "@/shared/lib/format";
import { LoanStatusBadge } from "./LoanStatusBadge";
import { StageStatusBadge } from "./StageStatusBadge";
import type {
	LoanTimelineProps,
	LoanApplicationStatus,
	LoanWorkflowStageStatus,
} from "@/entities/loan/types";
import { timelineSteps } from "@/entities/loan/constants";

export function LoanTimeline({
	stages = [],
	activationDate,
	election83bDueDate,
	loanStatus,
	isLoading,
	isError,
	onRetry,
	emptyTitle = "No workflow activity yet",
	emptyMessage = "Workflow stages will appear once the loan enters review.",
}: LoanTimelineProps) {
	if (isLoading) {
		return <LoadingState label="Loading timeline..." />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load timeline"
				message="Please try again."
				onRetry={onRetry}
			/>
		);
	}

	if (stages.length === 0 && !activationDate && !election83bDueDate) {
		return <EmptyState title={emptyTitle} message={emptyMessage} />;
	}

	const stageMap = new Map(stages.map((stage) => [stage.stage_type, stage]));
	const resolveActiveStatus = (
		status?: LoanApplicationStatus | null,
	): LoanWorkflowStageStatus => {
		if (status === "ACTIVE") return "COMPLETED";
		if (status === "IN_REVIEW" || status === "SUBMITTED") return "IN_PROGRESS";
		return activationDate ? "COMPLETED" : "PENDING";
	};

	return (
		<div className="space-y-4">
			{timelineSteps.map((step, index) => {
				const stage = step.stageType ? stageMap.get(step.stageType) : undefined;
				const isActiveStep = step.key === "active";
				const activeStatusLabel = loanStatus && normalizeDisplay(loanStatus);
				const stepLabel = isActiveStep
					? loanStatus && loanStatus !== "ACTIVE"
						? "Status"
						: step.label
					: step.label;
				const status = isActiveStep
					? resolveActiveStatus(loanStatus)
					: (stage?.status ?? "PENDING");
				const isLast = index === timelineSteps.length - 1;
				const showActivationMeta = step.key === "active";
				const show83bMeta = step.key === "election";
				const meta =
					showActivationMeta && activationDate
						? `Activated ${formatDate(activationDate)}`
						: showActivationMeta && activeStatusLabel
							? activeStatusLabel
							: showActivationMeta
								? "Awaiting activation"
								: show83bMeta && election83bDueDate
									? `Due ${formatDate(election83bDueDate)}`
									: show83bMeta && !election83bDueDate
										? "Due date pending"
										: stage?.completed_at
											? `Completed ${formatDate(stage.completed_at)}`
											: stage?.updated_at
												? `Updated ${formatDate(stage.updated_at)}`
												: null;

				return (
					<div key={step.key} className="flex gap-4">
						<div className="flex flex-col items-center">
							<span
								className={cn(
									"h-2.5 w-2.5 rounded-full",
									status === "COMPLETED"
										? "bg-emerald-500"
										: status === "IN_PROGRESS"
											? "bg-amber-500"
											: "bg-slate-300",
								)}
							/>
							{isLast ? null : (
								<span className="mt-1 h-full w-px flex-1 bg-border" />
							)}
						</div>

						<div className="flex-1 space-y-2 rounded-lg border border-transparent px-3 py-2 transition">
							<div className="flex flex-wrap items-center justify-between gap-2">
								<div className="space-y-1">
									<p className="text-sm font-semibold text-foreground">
										{stepLabel}
									</p>
									{meta ? (
										<p className="text-xs text-muted-foreground">{meta}</p>
									) : null}
								</div>
								{isActiveStep && loanStatus ? (
									<LoanStatusBadge status={loanStatus} />
								) : (
									<StageStatusBadge status={status} />
								)}
							</div>

							{stage?.notes ? (
								<p className="text-xs text-muted-foreground">{stage.notes}</p>
							) : null}

							{step.stageType ? (
								<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
									<span className="inline-flex items-center gap-1">
										<Clock className="h-3.5 w-3.5" />
										{normalizeDisplay(step.stageType)}
									</span>
									{stage?.created_at ? (
										<span className="inline-flex items-center gap-1">
											<Calendar className="h-3.5 w-3.5" />
											Created {formatDate(stage.created_at)}
										</span>
									) : null}
									{stage?.completed_at ? (
										<span className="inline-flex items-center gap-1">
											<CheckCircle2 className="h-3.5 w-3.5" />
											Completed {formatDate(stage.completed_at)}
										</span>
									) : null}
								</div>
							) : null}
						</div>
					</div>
				);
			})}
		</div>
	);
}
