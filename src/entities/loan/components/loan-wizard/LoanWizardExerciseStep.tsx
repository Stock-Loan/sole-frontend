import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { TabButton } from "@/shared/ui/TabButton";
import { Input } from "@/shared/ui/input";
import { formatCurrency } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import type { LoanWizardExerciseStepProps } from "@/entities/loan/types";

export function LoanWizardExerciseStep({
	isLoading,
	isError,
	onRetry,
	hasSummary,
	selectionMode,
	selectionValue,
	selectionError,
	onSelectionModeChange,
	onSelectionValueChange,
	totalExercisableShares,
	totalVestedShares,
	totalReservedShares,
	totalAvailableVestedShares,
	sharesToExercise,
	estimatedPurchasePrice,
}: LoanWizardExerciseStepProps) {
	if (isLoading) {
		return <LoanWizardExerciseStepSkeleton />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load stock summary"
				message="We couldn't load your stock summary to start the loan."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	if (!hasSummary) {
		return (
			<EmptyState
				title="Stock summary unavailable"
				message="Your stock summary is required to start a loan application."
			/>
		);
	}

	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
				<p className="text-base font-semibold text-foreground">
					Select exercise amount
				</p>
				<div className="mt-3 space-y-1 text-sm text-muted-foreground">
					<div className="flex items-center justify-between">
						<span>Vested shares</span>
						<span className="font-semibold text-foreground">
							{totalVestedShares !== undefined && totalVestedShares !== null
								? formatShares(totalVestedShares)
								: "—"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span>Reserved shares</span>
						<span className="font-semibold text-foreground">
							{totalReservedShares !== undefined &&
							totalReservedShares !== null
								? formatShares(totalReservedShares)
								: "—"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span>Available to exercise</span>
						<span className="font-semibold text-foreground">
							{totalAvailableVestedShares !== undefined &&
							totalAvailableVestedShares !== null
								? formatShares(totalAvailableVestedShares)
								: formatShares(totalExercisableShares)}
						</span>
					</div>
				</div>
				<div className="mt-4 inline-flex overflow-hidden rounded-full border border-border/70 bg-muted/30 p-1 shadow-sm">
					<TabButton
						label="By shares"
						value="SHARES"
						active={selectionMode === "SHARES"}
						onSelect={() => onSelectionModeChange("SHARES")}
						className="rounded-full"
					/>
					<TabButton
						label="By percent"
						value="PERCENT"
						active={selectionMode === "PERCENT"}
						onSelect={() => onSelectionModeChange("PERCENT")}
						className="rounded-full"
					/>
				</div>
				<div className="mt-4 max-w-sm">
					<label className="text-sm font-medium text-foreground">
						{selectionMode === "PERCENT"
							? "Percent of available vested shares"
							: "Shares to exercise"}
					</label>
					<Input
						type="number"
						min={0}
						max={selectionMode === "PERCENT" ? 100 : totalExercisableShares}
						step={selectionMode === "PERCENT" ? 1 : 1}
						className="mt-2 bg-background"
						value={selectionValue}
						onChange={(event) => onSelectionValueChange(event.target.value)}
					/>
					{selectionError ? (
						<p className="mt-2 text-sm text-destructive">{selectionError}</p>
					) : null}
				</div>
			</div>

			<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
				<p className="text-base font-semibold text-foreground">Estimate</p>
				<div className="mt-3 grid gap-2 text-sm text-muted-foreground">
					<div className="flex items-center justify-between">
						<span>Shares to exercise</span>
						<span className="text-foreground">
							{sharesToExercise > 0 ? formatShares(sharesToExercise) : "—"}
						</span>
					</div>
					<div className="flex items-center justify-between">
						<span>Estimated purchase price</span>
						<span className="text-foreground">
							{estimatedPurchasePrice
								? formatCurrency(estimatedPurchasePrice)
								: "—"}
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}

function LoanWizardExerciseStepSkeleton() {
	return (
		<div className="space-y-6">
			<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
				<Skeleton className="h-5 w-44" />
				<div className="mt-3 space-y-2">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={`exercise-summary-skeleton-${index}`}
							className="flex items-center justify-between"
						>
							<Skeleton className="h-3 w-28" />
							<Skeleton className="h-4 w-16" />
						</div>
					))}
				</div>
				<div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-muted/30 p-1 shadow-sm">
					<Skeleton className="h-8 w-24 rounded-full" />
					<Skeleton className="h-8 w-24 rounded-full" />
				</div>
				<div className="mt-4 max-w-sm space-y-2">
					<Skeleton className="h-4 w-48" />
					<Skeleton className="h-10 w-full" />
				</div>
			</div>

			<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
				<Skeleton className="h-5 w-24" />
				<div className="mt-3 space-y-2">
					{Array.from({ length: 2 }).map((_, index) => (
						<div
							key={`exercise-estimate-skeleton-${index}`}
							className="flex items-center justify-between"
						>
							<Skeleton className="h-3 w-36" />
							<Skeleton className="h-4 w-24" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
