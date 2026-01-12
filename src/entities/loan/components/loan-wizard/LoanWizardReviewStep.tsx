import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import type {
	LoanWizardDetailRowProps,
	LoanWizardReviewStepProps,
} from "@/entities/loan/types";

export function LoanWizardReviewStep({
	selectionMode,
	selectionValue,
	sharesToExercise,
	asOfDate,
	quote,
	selectedQuoteOption,
	maritalStatus,
	spouseInfo,
	requiresSpouseInfo,
	submitError,
	submitErrorSection,
	onEditStep,
}: LoanWizardReviewStepProps) {
	const selectionModeLabel = selectionMode === "PERCENT" ? "Percent" : "Shares";

	return (
		<div className="space-y-6">
			{submitError ? (
				<div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
					{submitError}
				</div>
			) : null}

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<CardTitle className="text-sm font-semibold">
						Exercise selection
					</CardTitle>
					<Button variant="ghost" size="sm" onClick={() => onEditStep("exercise")}>
						Edit
					</Button>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<DetailRow label="Selection mode" value={selectionModeLabel} />
					<DetailRow label="Selection value" value={selectionValue} />
					<DetailRow
						label="Shares to exercise"
						value={formatShares(sharesToExercise)}
					/>
					<DetailRow label="As of date" value={formatDate(asOfDate)} />
					{submitErrorSection === "exercise" ? (
						<p className="text-sm text-destructive">
							Please review your exercise amount and try again.
						</p>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<CardTitle className="text-sm font-semibold">Loan terms</CardTitle>
					<Button variant="ghost" size="sm" onClick={() => onEditStep("terms")}>
						Edit
					</Button>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					{quote ? (
						<>
							<DetailRow
								label="Interest type"
								value={selectedQuoteOption?.interest_type ?? "—"}
							/>
							<DetailRow
								label="Repayment method"
								value={selectedQuoteOption?.repayment_method ?? "—"}
							/>
							<DetailRow
								label="Term"
								value={
									selectedQuoteOption?.term_months
										? `${selectedQuoteOption.term_months} months`
										: "—"
								}
							/>
							<DetailRow
								label="Purchase price"
								value={formatCurrency(quote.purchase_price)}
							/>
							<DetailRow
								label="Down payment"
								value={formatCurrency(quote.down_payment_amount)}
							/>
							<DetailRow
								label="Loan principal"
								value={formatCurrency(quote.loan_principal)}
							/>
							<DetailRow
								label="Estimated monthly payment"
								value={
									selectedQuoteOption
										? formatCurrency(selectedQuoteOption.estimated_monthly_payment)
										: "—"
								}
							/>
							<DetailRow
								label="Total interest"
								value={
									selectedQuoteOption
										? formatCurrency(selectedQuoteOption.total_interest)
										: "—"
								}
							/>
							<DetailRow
								label="Total payable"
								value={
									selectedQuoteOption
										? formatCurrency(selectedQuoteOption.total_payable)
										: "—"
								}
							/>
						</>
					) : (
						<p className="text-sm text-muted-foreground">
							Quote details are unavailable. Please go back and recalculate.
						</p>
					)}
					{submitErrorSection === "terms" ? (
						<p className="text-sm text-destructive">
							Loan policy settings may have changed. Please review your loan
							terms.
						</p>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="flex flex-row items-center justify-between space-y-0">
					<CardTitle className="text-sm font-semibold">Consents</CardTitle>
					<Button
						variant="ghost"
						size="sm"
						onClick={() => onEditStep("marital")}
					>
						Edit
					</Button>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<DetailRow label="Marital status" value={maritalStatus ?? "—"} />
					{requiresSpouseInfo ? (
						spouseInfo ? (
							<>
								<DetailRow
										label="Spouse/partner"
										value={`${spouseInfo.spouse_first_name} ${spouseInfo.spouse_last_name}`.trim()}
									/>
									<DetailRow label="Spouse email" value={spouseInfo.spouse_email} />
									<DetailRow label="Spouse phone" value={spouseInfo.spouse_phone} />
									<DetailRow
										label="Spouse address"
										value={spouseInfo.spouse_address}
									/>
								</>
							) : (
							<p className="text-sm text-muted-foreground">
								Spouse/partner information is required.
							</p>
						)
					) : (
						<p className="text-sm text-muted-foreground">
							Spouse/partner information not required.
						</p>
					)}
					{submitErrorSection === "consents" ? (
						<p className="text-sm text-destructive">
							Please verify your marital status and spouse details.
						</p>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}

function DetailRow({ label, value }: LoanWizardDetailRowProps) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span>{label}</span>
			<span className="text-foreground">{value || "—"}</span>
		</div>
	);
}
