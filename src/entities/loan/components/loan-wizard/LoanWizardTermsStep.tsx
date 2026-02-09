import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import type { LoanWizardTermsStepProps } from "@/entities/loan/types";
import {
	loanWizardInterestTypeOptions,
	loanWizardRepaymentMethodOptions,
} from "../../constants";

export function LoanWizardTermsStep({
	policy,
	isLoading,
	isError,
	onRetry,
	interestType,
	repaymentMethod,
	termMonths,
	onInterestTypeChange,
	onRepaymentMethodChange,
	onTermMonthsChange,
	termsError,
	quote,
	quoteOptions,
	selectedQuoteIndex,
	onSelectQuoteOption,
	quoteLoading,
	quoteError,
	onRetryQuote,
}: LoanWizardTermsStepProps) {
	if (isLoading) {
		return <LoanWizardTermsStepSkeleton />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load loan policy"
				message="We couldn't load loan policy settings needed for quotes."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	if (!policy) {
		return (
			<EmptyState
				title="Loan policy unavailable"
				message="Loan policy settings are required to continue."
			/>
		);
	}

	return (
		<div className="space-y-6">
			<p className="text-xs text-muted-foreground">
				Loan terms are based on your organization’s policy settings.
			</p>
			<div className="grid gap-4 lg:grid-cols-2">
				<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
					<p className="text-sm font-semibold text-foreground">Interest type</p>
					<div className="mt-3 grid gap-3">
						{loanWizardInterestTypeOptions
							.filter((option) =>
								policy.allowed_interest_types.includes(option.value),
							)
							.map((option) => {
								const isActive = interestType === option.value;
								return (
									<button
										key={option.value}
										type="button"
										onClick={() => onInterestTypeChange(option.value)}
										className={cn(
											"flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
											isActive
												? "border-primary bg-primary/10 shadow-sm"
												: "border-border/70 bg-background hover:border-primary/50 hover:bg-muted/40",
										)}
									>
										<span
											className={cn(
												"mt-1 h-2.5 w-2.5 rounded-full border",
												isActive
													? "border-primary bg-primary"
													: "border-muted-foreground/40",
											)}
										/>
										<div>
											<p className="font-medium text-foreground">
												{option.label}
											</p>
											<p className="text-xs text-muted-foreground">
												{option.description}
											</p>
										</div>
									</button>
								);
							})}
					</div>
				</div>

				<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
					<p className="text-sm font-semibold text-foreground">
						Repayment method
					</p>
					<div className="mt-3 grid gap-3">
						{loanWizardRepaymentMethodOptions
							.filter((option) =>
								policy.allowed_repayment_methods.includes(option.value),
							)
							.map((option) => {
								const isActive = repaymentMethod === option.value;
								return (
									<button
										key={option.value}
										type="button"
										onClick={() => onRepaymentMethodChange(option.value)}
										className={cn(
											"flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition",
											isActive
												? "border-primary bg-primary/10 shadow-sm"
												: "border-border/70 bg-background hover:border-primary/50 hover:bg-muted/40",
										)}
									>
										<span
											className={cn(
												"mt-1 h-2.5 w-2.5 rounded-full border",
												isActive
													? "border-primary bg-primary"
													: "border-muted-foreground/40",
											)}
										/>
										<div>
											<p className="font-medium text-foreground">
												{option.label}
											</p>
											<p className="text-xs text-muted-foreground">
												{option.description}
											</p>
										</div>
									</button>
								);
							})}
					</div>
				</div>
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
					<label className="text-sm font-medium text-foreground">
						Term length (months)
					</label>
					<Input
						type="number"
						min={policy.min_loan_term_months}
						max={policy.max_loan_term_months}
						className="mt-2"
						value={termMonths ?? ""}
						onChange={(event) => {
							const nextValue = Number.isNaN(event.target.valueAsNumber)
								? null
								: event.target.valueAsNumber;
							onTermMonthsChange(nextValue);
						}}
					/>
					<p className="mt-2 text-xs text-muted-foreground">
						Allowed range: {policy.min_loan_term_months}–
						{policy.max_loan_term_months} months
					</p>
				</div>
				<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
					<p className="text-sm font-semibold text-foreground">Down payment</p>
					<p className="mt-2 text-sm text-muted-foreground">
						{policy.require_down_payment
							? `Required: ${formatPercent(policy.down_payment_percent ?? 0)}`
							: "No down payment required."}
					</p>
				</div>
			</div>

			<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<p className="text-sm font-semibold text-foreground">Quote</p>
					{termsError ? (
						<p className="text-sm text-destructive">{termsError}</p>
					) : null}
				</div>
				<div className="mt-3">
					{quoteLoading ? (
						<LoanWizardQuoteSkeleton />
					) : quoteError ? (
						<EmptyState
							title="Unable to calculate quote"
							message="Update the loan terms and retry."
							actionLabel="Retry"
							onRetry={onRetryQuote}
						/>
					) : quote ? (
						<div className="space-y-4">
							{quoteOptions.length > 1 ? (
								<div className="grid gap-3 md:grid-cols-2">
									{quoteOptions.map((option, index) => {
										const isActive = index === selectedQuoteIndex;
										return (
											<button
												key={`${option.interest_type}-${option.repayment_method}-${option.term_months}`}
												type="button"
												onClick={() => onSelectQuoteOption(index, option)}
												className={cn(
													"rounded-xl border px-4 py-3 text-left text-sm transition",
													isActive
														? "border-primary bg-primary/10 shadow-sm"
														: "border-border/70 bg-background hover:border-primary/50 hover:bg-muted/40",
												)}
											>
												<p className="font-medium text-foreground">
													{option.interest_type} • {option.repayment_method}
												</p>
												<p className="text-xs text-muted-foreground">
													{option.term_months} months ·{" "}
													{formatPercent(option.nominal_annual_rate)} APR
												</p>
												<p className="mt-2 text-sm text-foreground">
													{formatCurrency(option.estimated_monthly_payment)} /
													month
												</p>
											</button>
										);
									})}
								</div>
							) : null}

							<div className="grid gap-2 text-sm text-muted-foreground">
								<div className="flex items-center justify-between">
									<span>Shares to exercise</span>
									<span className="text-foreground">
										{formatShares(quote.shares_to_exercise)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Purchase price</span>
									<span className="text-foreground">
										{formatCurrency(quote.purchase_price)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Down payment</span>
									<span className="text-foreground">
										{formatCurrency(quote.down_payment_amount)}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span>Loan principal</span>
									<span className="text-foreground">
										{formatCurrency(quote.loan_principal)}
									</span>
								</div>
								{quoteOptions[selectedQuoteIndex] ? (
									<>
										<div className="flex items-center justify-between">
											<span>Estimated monthly payment</span>
											<span className="text-foreground">
												{formatCurrency(
													quoteOptions[selectedQuoteIndex]
														.estimated_monthly_payment,
												)}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span>Total interest</span>
											<span className="text-foreground">
												{formatCurrency(
													quoteOptions[selectedQuoteIndex].total_interest,
												)}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span>Total payable</span>
											<span className="text-foreground">
												{formatCurrency(
													quoteOptions[selectedQuoteIndex].total_payable,
												)}
											</span>
										</div>
									</>
								) : null}
							</div>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							Select loan terms to calculate a quote.
						</p>
					)}
				</div>
			</div>
		</div>
	);
}

function LoanWizardTermsStepSkeleton() {
	return (
		<div className="space-y-6">
			<Skeleton className="h-3 w-80 max-w-full" />

			<div className="grid gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<div
						key={`terms-selection-skeleton-${index}`}
						className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm"
					>
						<Skeleton className="h-4 w-32" />
						<div className="mt-3 grid gap-3">
							{Array.from({ length: 2 }).map((__, optionIndex) => (
								<div
									key={`terms-option-skeleton-${index}-${optionIndex}`}
									className="rounded-xl border border-border/70 bg-background px-4 py-3"
								>
									<Skeleton className="h-4 w-28" />
									<Skeleton className="mt-2 h-3 w-56 max-w-full" />
								</div>
							))}
						</div>
					</div>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2">
				<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="mt-2 h-10 w-full" />
					<Skeleton className="mt-2 h-3 w-44" />
				</div>
				<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
					<Skeleton className="h-4 w-24" />
					<Skeleton className="mt-2 h-3 w-44" />
				</div>
			</div>

			<div className="rounded-xl border border-border/60 bg-card/70 p-5 shadow-sm">
				<div className="flex items-center justify-between">
					<Skeleton className="h-4 w-14" />
					<Skeleton className="h-3 w-24" />
				</div>
				<div className="mt-3">
					<LoanWizardQuoteSkeleton />
				</div>
			</div>
		</div>
	);
}

function LoanWizardQuoteSkeleton() {
	return (
		<div className="space-y-4">
			<div className="grid gap-3 md:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<div
						key={`quote-option-skeleton-${index}`}
						className="rounded-xl border border-border/70 bg-background px-4 py-3"
					>
						<Skeleton className="h-4 w-40" />
						<Skeleton className="mt-2 h-3 w-32" />
						<Skeleton className="mt-2 h-4 w-28" />
					</div>
				))}
			</div>
			<div className="grid gap-2">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={`quote-row-skeleton-${index}`}
						className="flex items-center justify-between"
					>
						<Skeleton className="h-3 w-36" />
						<Skeleton className="h-4 w-24" />
					</div>
				))}
			</div>
		</div>
	);
}
