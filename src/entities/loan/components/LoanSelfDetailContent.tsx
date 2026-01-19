import { useEffect, useMemo, useState } from "react";
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
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { formatShares } from "@/entities/stock-grant/constants";
import { cn, normalizeDisplay } from "@/shared/lib/utils";
import { TabButton } from "@/shared/ui/TabButton";
import { Button } from "@/shared/ui/Button";
import { LoanDocumentList } from "@/entities/loan/components/LoanDocumentList";
import { LoanRepaymentsPanel } from "@/entities/loan/components/LoanRepaymentsPanel";
import { LoanSchedulePanel } from "@/entities/loan/components/LoanSchedulePanel";
import { LoanTimeline } from "@/entities/loan/components/LoanTimeline";
import { Loan83bPanel } from "@/entities/loan/components/Loan83bPanel";
import {
	useDownloadMyLoanDocument,
	useExportMyLoanCsv,
	useMyLoanRepayments,
	useMyLoanSchedule,
	useRegisterMyLoan83bDocument,
} from "@/entities/loan/hooks";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import { downloadBlob } from "@/shared/lib/download";
import { usePermissions } from "@/auth/hooks";
import type {
	LoanDetailTab,
	LoanDetailTabOption,
	LoanAllocationTableProps,
	LoanDetailRowProps,
	LoanDetailSummaryCardProps,
	LoanSelfDetailContentProps,
} from "@/entities/loan/components/types";
import type { LoanDocument } from "@/entities/loan/types";
import {
	formatDetailBoolean,
	formatDetailValue,
	formatEligibilityReasons,
	formatLoanSelectionValue,
	groupDocumentsByStage,
} from "@/entities/loan/components/detail-utils";

export function LoanSelfDetailContent({
	loan,
	isLoading,
	isError,
	onRetry,
	emptyTitle = "Unable to load loan",
	emptyMessage = "We couldn't fetch this loan application.",
	documentGroups: externalDocumentGroups,
	documentsLoading,
	documentsError,
	onDocumentsRetry,
	canViewDocuments = true,
}: LoanSelfDetailContentProps) {
	const { toast } = useToast();
	const { can } = usePermissions();
	const [downloadingDocumentId, setDownloadingDocumentId] = useState<
		string | null
	>(null);
	const [activeTab, setActiveTab] = useState<LoanDetailTab>("overview");
	const canViewRepayments = can("loan.payment.self.view");
	const canViewSchedule = can("loan.schedule.self.view");
	const canExportLoan = can("loan.export.self");
	const canUpload83b = can("loan.document.self_upload_83b");
	const downloadMutation = useDownloadMyLoanDocument({
		onError: (error) => {
			toast({
				title: "Download failed",
				description: parseApiError(error).message,
				variant: "destructive",
			});
		},
	});
	const isActiveLoan = loan?.status === "ACTIVE";
	const show83bAction =
		isActiveLoan && !loan?.has_83b_election && canUpload83b;
	const register83bMutation = useRegisterMyLoan83bDocument();
	const availableTabs = useMemo<LoanDetailTabOption[]>(() => {
		const options: LoanDetailTabOption[] = [
			{ id: "overview", label: "Overview" },
		];
		if (isActiveLoan && canViewRepayments) {
			options.push({ id: "repayments", label: "Repayments" });
		}
		if (isActiveLoan && canViewSchedule) {
			options.push({ id: "schedule", label: "Schedule" });
		}
		if (show83bAction) {
			options.push({ id: "83b", label: "83B Election" });
		}
		return options;
	}, [isActiveLoan, canViewRepayments, canViewSchedule, show83bAction]);
	const showTabs = isActiveLoan && availableTabs.length > 1;
	const repaymentsQuery = useMyLoanRepayments(loan?.id ?? "", {
		enabled:
			Boolean(loan?.id) &&
			isActiveLoan &&
			canViewRepayments &&
			activeTab === "repayments",
	});
	const scheduleQuery = useMyLoanSchedule(loan?.id ?? "", {
		enabled:
			Boolean(loan?.id) &&
			isActiveLoan &&
			canViewSchedule &&
			activeTab === "schedule",
	});
	const exportLoanMutation = useExportMyLoanCsv({
		onError: (error) => {
			toast({
				title: "Export failed",
				description: parseApiError(error).message,
				variant: "destructive",
			});
		},
	});

	useEffect(() => {
		if (!showTabs && activeTab !== "overview") {
			setActiveTab("overview");
			return;
		}
		const exists = availableTabs.some((tab) => tab.id === activeTab);
		if (!exists) {
			setActiveTab("overview");
		}
	}, [activeTab, availableTabs, showTabs]);

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
	const documentGroups =
		externalDocumentGroups ?? groupDocumentsByStage(documents);
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
	const handleExportLoan = async () => {
		if (!loan.id) return;
		const blob = await exportLoanMutation.mutateAsync(loan.id);
		downloadBlob(blob, `loan-${loan.id}.csv`);
	};
	const showOverview = !showTabs || activeTab === "overview";

	return (
		<div className="space-y-6">
			<div className="sticky top-2 z-30 pb-1 relative backdrop-blur before:content-[''] before:absolute before:-top-2.5 before:left-0 before:right-0 before:h-2.5 before:bg-background/90 before:backdrop-blur before:pointer-events-none">
				<div className="space-y-4 relative z-10">
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

					{showTabs ? (
						<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
							{availableTabs.map((tab) => (
								<TabButton
									key={tab.id}
									label={tab.label}
									value={tab.id}
									active={tab.id === activeTab}
									onSelect={(value) => setActiveTab(value)}
								/>
							))}
						</div>
					) : null}
				</div>
			</div>

			{showOverview ? (
				<>
					<div className="grid gap-4 lg:grid-cols-2">
						<Card>
							<CardHeader className="pb-2">
								<CardTitle className="text-sm font-semibold">
									Application info
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm text-muted-foreground">
								<DetailRow
									label="Loan ID"
									value={loan.id}
									valueClassName="break-all"
								/>
								<DetailRow
									label="As of date"
									value={formatDate(loan.as_of_date)}
								/>
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
								<DetailRow
									label="Created at"
									value={formatDate(loan.created_at)}
								/>
								<DetailRow
									label="Updated at"
									value={formatDate(loan.updated_at)}
								/>
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
									value={formatLoanSelectionValue(
										selectionMode,
										selectionValue,
									)}
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
								<DetailRow
									label="Repayment method"
									value={loan.repayment_method}
								/>
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
									eligibilitySnapshot?.eligible_to_exercise,
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
								<CardTitle className="text-sm font-semibold">
									Documents
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4 text-sm text-muted-foreground">
								{canViewDocuments ? (
									<LoanDocumentList
										groups={documentGroups}
										isLoading={documentsLoading}
										isError={documentsError}
										onRetry={onDocumentsRetry}
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
				</>
			) : null}

			{activeTab === "repayments" ? (
				<LoanRepaymentsPanel
					repayments={repaymentsQuery.data?.items ?? []}
					total={repaymentsQuery.data?.total}
					isLoading={repaymentsQuery.isLoading}
					isError={repaymentsQuery.isError}
					onRetry={() => repaymentsQuery.refetch()}
					className="min-h-[360px] h-[calc(100dvh-320px)]"
				/>
			) : null}

			{activeTab === "schedule" ? (
				<LoanSchedulePanel
					schedule={scheduleQuery.data ?? null}
					isLoading={scheduleQuery.isLoading}
					isError={scheduleQuery.isError}
					onRetry={() => scheduleQuery.refetch()}
					actions={
						canExportLoan ? (
							<Button
								variant="outline"
								size="sm"
								onClick={handleExportLoan}
								disabled={exportLoanMutation.isPending}
							>
								{exportLoanMutation.isPending
									? "Exporting..."
									: "Export loan CSV"}
							</Button>
						) : null
					}
				/>
			) : null}

			{activeTab === "83b" && loan ? (
				<Loan83bPanel
					loanId={loan.id}
					dueDate={loan.election_83b_due_date}
					daysUntilDue={loan.days_until_83b_due}
					onRegister={(payload) =>
						register83bMutation.mutateAsync({ id: loan.id, payload })
					}
					isRegistering={register83bMutation.isPending}
				/>
			) : null}
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
