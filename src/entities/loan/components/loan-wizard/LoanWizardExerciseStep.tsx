import { LoadingState } from "@/shared/ui/LoadingState";
import { EmptyState } from "@/shared/ui/EmptyState";
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
	sharesToExercise,
	estimatedPurchasePrice,
}: LoanWizardExerciseStepProps) {
	if (isLoading) {
		return <LoadingState label="Loading stock summary..." />;
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
			<div className="rounded-lg border border-border/70 p-4 shadow-sm">
				<p className="text-sm font-semibold text-foreground">
					Select exercise amount
				</p>
				<p className="text-sm text-muted-foreground">
					Exercisable shares available:{" "}
					<span className="font-semibold text-foreground">
						{formatShares(totalExercisableShares)}
					</span>
				</p>
				<div className="mt-4 inline-flex rounded-lg border bg-muted/30 p-1">
					<TabButton
						label="By shares"
						value="SHARES"
						active={selectionMode === "SHARES"}
						onSelect={() => onSelectionModeChange("SHARES")}
					/>
					<TabButton
						label="By percent"
						value="PERCENT"
						active={selectionMode === "PERCENT"}
						onSelect={() => onSelectionModeChange("PERCENT")}
					/>
				</div>
				<div className="mt-4 max-w-sm">
					<label className="text-sm font-medium text-foreground">
						{selectionMode === "PERCENT"
							? "Percent of exercisable shares"
							: "Shares to exercise"}
					</label>
					<Input
						type="number"
						min={0}
						max={selectionMode === "PERCENT" ? 100 : totalExercisableShares}
						step={selectionMode === "PERCENT" ? 1 : 1}
						className="mt-2"
						value={selectionValue}
						onChange={(event) => onSelectionValueChange(event.target.value)}
					/>
					{selectionError ? (
						<p className="mt-2 text-sm text-destructive">{selectionError}</p>
					) : null}
				</div>
			</div>

			<div className="rounded-lg border border-border/70 p-4 shadow-sm">
				<p className="text-sm font-semibold text-foreground">Estimate</p>
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
