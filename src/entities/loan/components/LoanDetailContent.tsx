import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/Skeleton";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/shared/ui/Table/table";
import { formatCurrency, formatDate, formatPercent } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import { cn } from "@/shared/lib/utils";
import { colorPalette } from "@/app/styles/color-palette";
import {
	formatDetailBoolean,
	formatDetailValue,
	formatEligibilityReasons,
	formatList,
	formatLoanSelectionValue,
	formatYears,
	groupDocumentsByStage,
} from "@/entities/loan/components/detail-utils";
import { LoanDocumentList } from "@/entities/loan/components/LoanDocumentList";
import { LoanTimeline } from "@/entities/loan/components/LoanTimeline";
import { useDownloadOrgLoanDocument, useOrgLoanDocuments } from "@/entities/loan/hooks";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import { downloadBlob } from "@/shared/lib/download";
import { usePermissions } from "@/auth/hooks";
import type {
	LoanAllocationTableProps,
	LoanDetailContentProps,
	LoanDetailRowProps,
	LoanDetailSummaryCardProps,
} from "@/entities/loan/components/types";
import type { LoanDocument } from "@/entities/loan/types";

export function LoanDetailContent({
	loan,
	isLoading,
	isError,
	onRetry,
	emptyTitle = "Unable to load loan",
	emptyMessage = "We couldn't fetch this loan application.",
}: LoanDetailContentProps) {
	const { toast } = useToast();
	const { can } = usePermissions();
	const [downloadingDocumentId, setDownloadingDocumentId] = useState<
		string | null
	>(null);
	const canViewDocuments = can([
		"loan.document.view",
		"loan.document.manage_hr",
		"loan.document.manage_finance",
		"loan.document.manage_legal",
		"loan.workflow.post_issuance.manage",
	]);
	const downloadMutation = useDownloadOrgLoanDocument({
		onError: (error) => {
			toast({
				title: "Download failed",
				description: parseApiError(error).message,
				variant: "destructive",
			});
		},
	});
	const documentsQuery = useOrgLoanDocuments(loan?.id ?? "", {
		enabled: Boolean(loan?.id) && canViewDocuments,
	});

	if (isLoading) {
		return <LoanDetailSkeleton />;
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

	const selectionMode =
		loan.selection_mode ?? loan.quote_inputs_snapshot?.selection_mode ?? null;
	const selectionValue =
		loan.selection_value_snapshot ??
		loan.quote_inputs_snapshot?.selection_value ??
		null;
	const allocationSnapshot = loan.allocation_snapshot ?? [];
	const workflowStages = loan.workflow_stages ?? [];
	const documents = loan.documents ?? [];
	const documentGroups =
		documentsQuery.data?.groups ?? groupDocumentsByStage(documents);
	const orgSettings = loan.org_settings_snapshot ?? null;
	const eligibilitySnapshot = loan.eligibility_result_snapshot ?? null;
	const handleDownload = async (doc: LoanDocument) => {
		if (!doc.id) return;
		setDownloadingDocumentId(doc.id);
		try {
			const blob = await downloadMutation.mutateAsync(doc.id);
			downloadBlob(blob, doc.file_name ?? "document");
		} finally {
			setDownloadingDocumentId(null);
		}
	};

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
						<DetailRow label="Org ID" value={loan.org_id} valueClassName="break-all" />
						<DetailRow
							label="Org membership ID"
							value={loan.org_membership_id}
							valueClassName="break-all"
						/>
						<DetailRow label="Version" value={loan.version} />
						<DetailRow
							label="Policy version snapshot"
							value={loan.policy_version_snapshot}
						/>
						<DetailRow label="As of date" value={formatDate(loan.as_of_date)} />
						<DetailRow
							label="Activation date"
							value={formatDate(loan.activation_date)}
						/>
						<DetailRow
							label="83(b) due date"
							value={formatDate(loan.election_83b_due_date)}
						/>
						<DetailRow
							label="Days until 83(b)"
							value={loan.days_until_83b_due}
						/>
						<DetailRow
							label="Share certificate"
							value={formatDetailBoolean(loan.has_share_certificate)}
						/>
						<DetailRow
							label="83(b) election filed"
							value={formatDetailBoolean(loan.has_83b_election)}
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
						<DetailRow label="Selection mode" value={selectionMode} />
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

			{loan.applicant ? (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">Applicant</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow label="Full name" value={loan.applicant.full_name} />
						<DetailRow label="Email" value={loan.applicant.email} />
						<DetailRow
							label="Employee ID"
							value={loan.applicant.employee_id}
						/>
						<DetailRow
							label="Department"
							value={loan.applicant.department_name}
						/>
						<DetailRow
							label="Department ID"
							value={loan.applicant.department_id}
							valueClassName="break-all"
						/>
						<DetailRow
							label="User ID"
							value={loan.applicant.user_id}
							valueClassName="break-all"
						/>
						<DetailRow
							label="Org membership ID"
							value={loan.applicant.org_membership_id}
							valueClassName="break-all"
						/>
					</CardContent>
				</Card>
			) : null}

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
							label="Nominal annual rate"
							value={formatPercent(loan.nominal_annual_rate_percent)}
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

			<div className="grid gap-4 lg:grid-cols-2">
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
							Policy snapshot
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow
							label="Policy version"
							value={orgSettings?.policy_version}
						/>
						<DetailRow
							label="Service duration rule"
							value={formatDetailBoolean(
								orgSettings?.enforce_service_duration_rule
							)}
						/>
						<DetailRow
							label="Min service duration"
							value={formatYears(orgSettings?.min_service_duration_years)}
						/>
						<DetailRow
							label="Min vested rule"
							value={formatDetailBoolean(
								orgSettings?.enforce_min_vested_to_exercise
							)}
						/>
						<DetailRow
							label="Min vested shares"
							value={orgSettings?.min_vested_shares_to_exercise}
						/>
						<DetailRow
							label="Allowed repayment methods"
							value={formatList(orgSettings?.allowed_repayment_methods)}
						/>
						<DetailRow
							label="Allowed interest types"
							value={formatList(orgSettings?.allowed_interest_types)}
						/>
						<DetailRow
							label="Term range"
							value={
								orgSettings
									? `${orgSettings.min_loan_term_months}–${orgSettings.max_loan_term_months} months`
									: "—"
							}
						/>
						<DetailRow
							label="Fixed annual rate"
							value={formatPercent(orgSettings?.fixed_interest_rate_annual_percent)}
						/>
						<DetailRow
							label="Variable base rate"
							value={formatPercent(orgSettings?.variable_base_rate_annual_percent)}
						/>
						<DetailRow
							label="Variable margin"
							value={formatPercent(orgSettings?.variable_margin_annual_percent)}
						/>
						<DetailRow
							label="Require down payment"
							value={formatDetailBoolean(orgSettings?.require_down_payment)}
						/>
						<DetailRow
							label="Down payment percent"
							value={formatPercent(orgSettings?.down_payment_percent)}
						/>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Quote inputs snapshot
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow
							label="Selection mode"
							value={loan.quote_inputs_snapshot?.selection_mode}
						/>
						<DetailRow
							label="Selection value"
							value={formatLoanSelectionValue(
								loan.quote_inputs_snapshot?.selection_mode ?? null,
								loan.quote_inputs_snapshot?.selection_value ?? null
							)}
						/>
						<DetailRow
							label="Desired term"
							value={
								loan.quote_inputs_snapshot?.desired_term_months
									? `${loan.quote_inputs_snapshot.desired_term_months} months`
									: "—"
							}
						/>
						<DetailRow
							label="Desired interest type"
							value={loan.quote_inputs_snapshot?.desired_interest_type}
						/>
						<DetailRow
							label="Desired repayment method"
							value={loan.quote_inputs_snapshot?.desired_repayment_method}
						/>
						<DetailRow
							label="As of date"
							value={formatDate(loan.quote_inputs_snapshot?.as_of_date)}
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Quote option snapshot
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow
							label="Interest type"
							value={loan.quote_option_snapshot?.interest_type}
						/>
						<DetailRow
							label="Repayment method"
							value={loan.quote_option_snapshot?.repayment_method}
						/>
						<DetailRow
							label="Term"
							value={
								loan.quote_option_snapshot?.term_months
									? `${loan.quote_option_snapshot.term_months} months`
									: "—"
							}
						/>
						<DetailRow
							label="Nominal annual rate"
							value={formatPercent(
								loan.quote_option_snapshot?.nominal_annual_rate
							)}
						/>
						<DetailRow
							label="Estimated monthly payment"
							value={formatCurrency(
								loan.quote_option_snapshot?.estimated_monthly_payment
							)}
						/>
						<DetailRow
							label="Total interest"
							value={formatCurrency(loan.quote_option_snapshot?.total_interest)}
						/>
						<DetailRow
							label="Total payable"
							value={formatCurrency(loan.quote_option_snapshot?.total_payable)}
						/>
					</CardContent>
				</Card>
			</div>

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
						<LoanTimeline
							stages={workflowStages}
							activationDate={loan.activation_date}
							election83bDueDate={loan.election_83b_due_date}
							loanStatus={loan.status}
							emptyTitle="No workflow stages yet"
							emptyMessage="Stages will appear once reviewers start the process."
						/>
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">Documents</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						{canViewDocuments ? (
							<LoanDocumentList
								groups={documentGroups}
								isLoading={documentsQuery.isLoading}
								isError={documentsQuery.isError}
								onRetry={() => documentsQuery.refetch()}
								emptyTitle="No documents uploaded yet"
								emptyMessage="Documents will show up here once uploaded."
								onDownload={handleDownload}
								downloadingDocumentId={downloadingDocumentId}
							/>
						) : (
							<p>You do not have permission to view documents.</p>
						)}
					</CardContent>
				</Card>
			</div>

			{loan.marital_status_snapshot ? (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">Consents</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 text-sm text-muted-foreground">
						<DetailRow
							label="Marital status"
							value={loan.marital_status_snapshot}
						/>
						{loan.spouse_first_name || loan.spouse_last_name ? (
							<DetailRow
								label="Spouse/partner"
								value={`${loan.spouse_first_name ?? ""} ${loan.spouse_middle_name ?? ""} ${loan.spouse_last_name ?? ""}`
									.replace(/\s+/g, " ")
									.trim()}
							/>
						) : null}
						<DetailRow label="Spouse email" value={loan.spouse_email} />
						<DetailRow label="Spouse phone" value={loan.spouse_phone} />
						<DetailRow label="Spouse address" value={loan.spouse_address} />
					</CardContent>
				</Card>
			) : null}

			{loan.decision_reason ? (
				<div
					className={cn(
						"rounded-lg border p-4",
						loan.status === "REJECTED"
							? "border-red-200 bg-red-50/70"
							: "border-amber-200 bg-amber-50/70"
					)}
				>
					<div className="flex items-start gap-3">
						{loan.status === "REJECTED" ? (
							<AlertTriangle className="mt-0.5 h-5 w-5 text-red-600" />
						) : (
							<CheckCircle2 className="mt-0.5 h-5 w-5 text-amber-600" />
						)}
						<div>
							<p className="text-sm font-semibold text-foreground">
								Decision notes
							</p>
							<p className="text-sm text-muted-foreground">
								{loan.decision_reason}
							</p>
						</div>
					</div>
				</div>
			) : null}
		</div>
	);
}

function SummaryCard({ label, value }: LoanDetailSummaryCardProps) {
	return (
		<Card
			className="relative overflow-hidden"
			style={{
				borderColor: colorPalette.slate[200],
				backgroundColor: colorPalette.semantic.surface,
			}}
		>
			<div
				className="absolute left-0 top-0 h-full w-1"
				style={{ backgroundColor: colorPalette.semantic.primary }}
			/>
			<CardHeader className="pb-2">
				<CardTitle
					className="text-xs font-semibold uppercase tracking-wide"
					style={{ color: colorPalette.slate[500] }}
				>
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p
					className="text-2xl font-semibold"
					style={{ color: colorPalette.navy[900] }}
				>
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

function LoanDetailSkeleton() {
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
