import { EmptyState } from "@/shared/ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/Table/table";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import { cn, normalizeDisplay } from "@/shared/lib/utils";
import type {
	LoanAllocationTableProps,
	LoanDetailRowProps,
	LoanDetailSummaryCardProps,
	LoanSelfDetailContentProps,
	LoanSelfDocumentsListProps,
	LoanSelfWorkflowStagesProps,
} from "@/entities/loan/components/types";
import {
	formatDetailBoolean,
	formatDetailValue,
	formatEligibilityReasons,
	formatLoanSelectionValue,
} from "@/entities/loan/components/detail-utils";

export function LoanSelfDetailContent({
	loan,
	isLoading,
	isError,
	onRetry,
	emptyTitle = "Unable to load loan",
	emptyMessage = "We couldn't fetch this loan application.",
}: LoanSelfDetailContentProps) {
	if (isLoading) {
		return <LoanSelfDetailSkeleton />;
	}

	if (isError || !loan) {
		return (
			<EmptyState
				title={emptyTitle}
				message={emptyMessage}
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	const selectionMode = loan.selection_mode ?? null;
	const selectionValue = loan.selection_value_snapshot ?? null;
	const allocationSnapshot = loan.allocation_snapshot ?? [];
	const workflowStages = loan.workflow_stages ?? [];
	const documents = loan.documents ?? [];
	const eligibilitySnapshot = loan.eligibility_result_snapshot ?? null;

	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<SummaryCard label="Status" value={loan.status} />
				<SummaryCard
					label="Shares to exercise"
					value={formatShares(loan.shares_to_exercise)}
				/>
				<SummaryCard
					label="Loan principal"
					value={formatCurrency(loan.loan_principal)}
				/>
				<SummaryCard
					label="Term"
					value={loan.term_months ? `${loan.term_months} months` : "—"}
				/>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Application info
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow label="Loan ID" value={loan.id} valueClassName="break-all" />
						<DetailRow label="As of date" value={formatDate(loan.as_of_date)} />
						<DetailRow
							label="Current stage type"
							value={normalizeDisplay(loan.current_stage_type ?? "—")}
						/>
						<DetailRow
							label="Current stage status"
							value={normalizeDisplay(loan.current_stage_status ?? "—")}
						/>
						<DetailRow
							label="Share certificate"
							value={formatDetailBoolean(loan.has_share_certificate)}
						/>
						<DetailRow
							label="83(b) election filed"
							value={formatDetailBoolean(loan.has_83b_election)}
						/>
						<DetailRow
							label="Days until 83(b)"
							value={loan.days_until_83b_due}
						/>
						<DetailRow label="Created at" value={formatDate(loan.created_at)} />
						<DetailRow label="Updated at" value={formatDate(loan.updated_at)} />
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Selection snapshot
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow
							label="Selection mode"
							value={normalizeDisplay(selectionMode ?? "—")}
						/>
						<DetailRow
							label="Selection value"
							value={formatLoanSelectionValue(selectionMode, selectionValue)}
						/>
						<DetailRow
							label="Total exercisable"
							value={formatShares(loan.total_exercisable_shares_snapshot)}
						/>
						<DetailRow
							label="Shares to exercise"
							value={formatShares(loan.shares_to_exercise)}
						/>
						<DetailRow
							label="Allocation strategy"
							value={loan.allocation_strategy}
						/>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Financial summary
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow
							label="Purchase price"
							value={formatCurrency(loan.purchase_price)}
						/>
						<DetailRow
							label="Down payment"
							value={formatCurrency(loan.down_payment_amount)}
						/>
						<DetailRow
							label="Loan principal"
							value={formatCurrency(loan.loan_principal)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Quote summary
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow label="Interest type" value={loan.interest_type} />
						<DetailRow label="Repayment method" value={loan.repayment_method} />
						<DetailRow
							label="Term"
							value={loan.term_months ? `${loan.term_months} months` : "—"}
						/>
						<DetailRow
							label="Estimated monthly payment"
							value={formatCurrency(loan.estimated_monthly_payment)}
						/>
						<DetailRow
							label="Total interest"
							value={formatCurrency(loan.total_interest_amount)}
						/>
						<DetailRow
							label="Total payable"
							value={formatCurrency(loan.total_payable_amount)}
						/>
					</CardContent>
				</Card>
			</div>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">
						Eligibility snapshot
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm text-muted-foreground">
					<DetailRow
						label="Eligible to exercise"
						value={formatDetailBoolean(
							eligibilitySnapshot?.eligible_to_exercise
						)}
					/>
					<DetailRow
						label="Total granted shares"
						value={formatShares(eligibilitySnapshot?.total_granted_shares)}
					/>
					<DetailRow
						label="Total vested shares"
						value={formatShares(eligibilitySnapshot?.total_vested_shares)}
					/>
					<DetailRow
						label="Total unvested shares"
						value={formatShares(eligibilitySnapshot?.total_unvested_shares)}
					/>
					<DetailRow
						label="Eligibility reasons"
						value={formatEligibilityReasons(eligibilitySnapshot?.reasons)}
					/>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">
						Allocation snapshot
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					{allocationSnapshot.length === 0 ? (
						<p>No allocation snapshot available.</p>
					) : (
						<AllocationTable allocations={allocationSnapshot} />
					)}
				</CardContent>
			</Card>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Workflow stages
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						{workflowStages.length === 0 ? (
							<p>No workflow stages yet.</p>
						) : (
							<SelfWorkflowStagesList stages={workflowStages} />
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">Documents</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						{documents.length === 0 ? (
							<p>No documents uploaded yet.</p>
						) : (
							<SelfDocumentsList documents={documents} />
						)}
					</CardContent>
				</Card>
			</div>

		</div>
	);
}

function SummaryCard({ label, value }: LoanDetailSummaryCardProps) {
	return (
		<Card>
			<CardHeader className="pb-2">
				<CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-2xl font-semibold text-foreground">
					{formatDetailValue(value)}
				</p>
			</CardContent>
		</Card>
	);
}

function DetailRow({ label, value, valueClassName }: LoanDetailRowProps) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span>{label}</span>
			<span className={cn("text-foreground", valueClassName)}>
				{formatDetailValue(value)}
			</span>
		</div>
	);
}

function AllocationTable({ allocations }: LoanAllocationTableProps) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>Grant ID</TableHead>
					<TableHead>Grant date</TableHead>
					<TableHead>Shares</TableHead>
					<TableHead>Exercise price</TableHead>
					<TableHead>Purchase price</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{allocations.map((item) => (
					<TableRow key={item.grant_id}>
						<TableCell className="break-all">{item.grant_id}</TableCell>
						<TableCell>{formatDate(item.grant_date)}</TableCell>
						<TableCell>{formatShares(item.shares)}</TableCell>
						<TableCell>{formatCurrency(item.exercise_price)}</TableCell>
						<TableCell>{formatCurrency(item.purchase_price)}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}

function SelfWorkflowStagesList({ stages }: LoanSelfWorkflowStagesProps) {
	return (
		<div className="space-y-4">
			{stages.map((stage, index) => (
				<div key={`${stage.stage_type}-${index}`} className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{normalizeDisplay(stage.stage_type ?? "Stage")}
					</p>
					<DetailRow label="Status" value={stage.status} />
					<DetailRow label="Created at" value={formatDate(stage.created_at)} />
					<DetailRow label="Updated at" value={formatDate(stage.updated_at)} />
					<DetailRow
						label="Completed at"
						value={formatDate(stage.completed_at)}
					/>
				</div>
			))}
		</div>
	);
}

function SelfDocumentsList({ documents }: LoanSelfDocumentsListProps) {
	return (
		<div className="space-y-4">
			{documents.map((doc, index) => (
				<div key={doc.id ?? `loan-doc-${index}`} className="space-y-1">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{normalizeDisplay(doc.document_type ?? "Document")}
					</p>
					<DetailRow label="File name" value={doc.file_name} />
					<DetailRow
						label="Uploaded at"
						value={formatDate(doc.uploaded_at)}
					/>
					<DetailRow
						label="Storage"
						value={doc.storage_path_or_url ?? doc.storage_url}
						valueClassName="break-all"
					/>
				</div>
			))}
		</div>
	);
}

function LoanSelfDetailSkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				{Array.from({ length: 4 }).map((_, index) => (
					<Card key={`loan-detail-skeleton-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-3 w-24" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-7 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<Card key={`loan-detail-card-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-32" />
						</CardHeader>
						<CardContent className="space-y-3">
							{Array.from({ length: 5 }).map((__, rowIndex) => (
								<div
									key={`loan-detail-row-${index}-${rowIndex}`}
									className="flex items-center justify-between"
								>
									<Skeleton className="h-3 w-28" />
									<Skeleton className="h-3 w-24" />
								</div>
							))}
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
