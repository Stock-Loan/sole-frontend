import { useMemo, useState } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type {
	ColumnDefinition,
	DataTablePreferencesConfig,
} from "@/shared/ui/Table/types";
import { loadDataTablePreferences } from "@/shared/ui/Table/constants";
import { TabButton } from "@/shared/ui/TabButton";
import { ToolbarButton } from "@/shared/ui/toolbar";
import { Input } from "@/shared/ui/input";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import { routes } from "@/shared/lib/routes";
import { useAuth, usePermissions } from "@/auth/hooks";
import {
	useFinanceLoanQueue,
	useHrLoanQueue,
	useLegalLoanQueue,
	useMyFinanceLoanQueue,
	useMyHrLoanQueue,
	useMyLegalLoanQueue,
	useAssignLoanWorkflowStage,
} from "@/entities/loan/hooks";
import { LoanStatusBadge } from "@/entities/loan/components/LoanStatusBadge";
import { StageStatusBadge } from "@/entities/loan/components/StageStatusBadge";
import type {
	LoanApplicationSummary,
	LoanWorkflowStageType,
} from "@/entities/loan/types";
import { useOrgUsersSearch } from "@/entities/user/hooks";

const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];
const DEFAULT_PAGE_SIZE = 20;
const QUEUE_SCOPE_OPTIONS = [
	{ id: "all", label: "All Queue" },
	{ id: "mine", label: "My Queue" },
] as const;
const QUEUE_TABS = [
	{
		id: "hr",
		label: "HR Queue",
		permission: "loan.queue.hr.view",
		description: "Review employee eligibility and policy compliance.",
	},
	{
		id: "finance",
		label: "Finance Queue",
		permission: "loan.queue.finance.view",
		description: "Validate repayment terms and funding readiness.",
	},
	{
		id: "legal",
		label: "Legal Queue",
		permission: "loan.queue.legal.view",
		description: "Confirm document requirements and legal checkpoints.",
	},
] as const;

function getManagePermission(stageType?: LoanWorkflowStageType | null) {
	if (!stageType) return null;
	if (stageType === "HR_REVIEW") return "loan.workflow.hr.manage";
	if (stageType === "FINANCE_PROCESSING") return "loan.workflow.finance.manage";
	if (stageType === "LEGAL_EXECUTION") return "loan.workflow.legal.manage";
	return null;
}

export function QueuePage() {
	const navigate = useNavigate();
	const { can } = usePermissions();
	const { user } = useAuth();
	const { toast } = useToast();

	const visibleTabs = useMemo(
		() => QUEUE_TABS.filter((tab) => can(tab.permission)),
		[can]
	);
	const [selectedTab, setSelectedTab] = useState<string>("");
	const [queueScope, setQueueScope] = useState<string>("all");

	const activeTab =
		visibleTabs.find((tab) => tab.id === selectedTab)?.id ??
		visibleTabs[0]?.id ??
		"";
	const activeCopy = visibleTabs.find((tab) => tab.id === activeTab);

	const queueParams = useMemo(
		() => ({
			limit: 200,
			offset: 0,
		}),
		[]
	);

	const hrQuery = useHrLoanQueue(queueParams, {
		enabled:
			can("loan.queue.hr.view") && activeTab === "hr" && queueScope === "all",
	});
	const financeQuery = useFinanceLoanQueue(queueParams, {
		enabled:
			can("loan.queue.finance.view") &&
			activeTab === "finance" &&
			queueScope === "all",
	});
	const legalQuery = useLegalLoanQueue(queueParams, {
		enabled:
			can("loan.queue.legal.view") &&
			activeTab === "legal" &&
			queueScope === "all",
	});
	const myHrQuery = useMyHrLoanQueue(queueParams, {
		enabled:
			can("loan.queue.hr.view") && activeTab === "hr" && queueScope === "mine",
	});
	const myFinanceQuery = useMyFinanceLoanQueue(queueParams, {
		enabled:
			can("loan.queue.finance.view") &&
			activeTab === "finance" &&
			queueScope === "mine",
	});
	const myLegalQuery = useMyLegalLoanQueue(queueParams, {
		enabled:
			can("loan.queue.legal.view") &&
			activeTab === "legal" &&
			queueScope === "mine",
	});

	const activeQuery =
		queueScope === "mine"
			? activeTab === "finance"
				? myFinanceQuery
				: activeTab === "legal"
				? myLegalQuery
				: myHrQuery
			: activeTab === "finance"
			? financeQuery
			: activeTab === "legal"
			? legalQuery
			: hrQuery;

	const loans = useMemo(
		() => activeQuery.data?.items ?? [],
		[activeQuery.data]
	);

	const preferencesConfig = useMemo<DataTablePreferencesConfig>(
		() => ({
			id: `workflow-queue-${activeTab || "default"}`,
			scope: "user",
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
		}),
		[activeTab, user?.id, user?.org_id]
	);
	const persistedPreferences = useMemo(
		() => loadDataTablePreferences(preferencesConfig),
		[preferencesConfig]
	);
	const preferredPageSize =
		typeof persistedPreferences?.pagination?.pageSize === "number"
			? persistedPreferences.pagination.pageSize
			: DEFAULT_PAGE_SIZE;

	const assignMutation = useAssignLoanWorkflowStage();
	const canAssignAny = can("loan.workflow.assign.any");
	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
	const [assignmentTarget, setAssignmentTarget] =
		useState<LoanApplicationSummary | null>(null);
	const [userSearchTerm, setUserSearchTerm] = useState("");
	const [selectedAssigneeId, setSelectedAssigneeId] = useState("");
	const usersQuery = useOrgUsersSearch(userSearchTerm.trim(), userSearchTerm, {
		enabled: assignDialogOpen && userSearchTerm.trim().length > 0,
	});
	const assigneeOptions = usersQuery.data?.items ?? [];

	const columns = useMemo<ColumnDefinition<LoanApplicationSummary>[]>(
		() => [
			{
				id: "loanId",
				header: "Loan ID",
				accessor: (loan) => loan.id,
				filterAccessor: (loan) => loan.id,
				cell: (loan) => (
					<Link
						to={routes.workflowsRequestDetail.replace(":requestId", loan.id)}
						className="font-medium text-primary underline-offset-4 hover:underline"
					>
						{loan.id}
					</Link>
				),
				headerClassName: "min-w-[200px]",
			},
			{
				id: "applicantName",
				header: "Applicant",
				accessor: (loan) => loan.applicant?.full_name ?? "",
				filterAccessor: (loan) =>
					`${loan.applicant?.full_name ?? ""} ${
						loan.applicant?.email ?? ""
					}`.trim(),
				cell: (loan) => loan.applicant?.full_name ?? "—",
				headerClassName: "min-w-[180px]",
			},
			{
				id: "applicantEmail",
				header: "Email",
				accessor: (loan) => loan.applicant?.email ?? "",
				cell: (loan) => loan.applicant?.email ?? "—",
			},
			{
				id: "status",
				header: "Status",
				accessor: (loan) => loan.status,
				cell: (loan) => <LoanStatusBadge status={loan.status} />,
			},
			{
				id: "assignee",
				header: "Assignee",
				accessor: (loan) => loan.current_stage_assignee?.full_name ?? "",
				cell: (loan) =>
					loan.current_stage_assignee?.full_name ??
					loan.current_stage_assignee?.email ??
					"Unassigned",
			},
			{
				id: "assignedAt",
				header: "Assigned at",
				accessor: (loan) => loan.current_stage_assigned_at ?? "",
				cell: (loan) => formatDate(loan.current_stage_assigned_at),
			},
			{
				id: "currentStageType",
				header: "Stage",
				accessor: (loan) => loan.current_stage_type ?? "",
				cell: (loan) => normalizeDisplay(loan.current_stage_type ?? "—"),
			},
			{
				id: "currentStageStatus",
				header: "Stage status",
				accessor: (loan) => loan.current_stage_status ?? "",
				cell: (loan) =>
					loan.current_stage_status ? (
						<StageStatusBadge status={loan.current_stage_status} />
					) : (
						"—"
					),
			},
			{
				id: "assignAction",
				header: "Assignment",
				accessor: () => "",
				enableSorting: false,
				enableFiltering: false,
				cell: (loan) => {
					const stageType = loan.current_stage_type ?? null;
					const permission = getManagePermission(stageType);
					const canAssignSelf = permission ? can(permission) : false;
					const isCompleted = loan.current_stage_status === "COMPLETED";
					return (
						<Button
							variant="outline"
							size="sm"
							disabled={!canAssignSelf || isCompleted || !stageType}
							onClick={async (event) => {
								event.stopPropagation();
								if (!stageType) return;
								try {
									await assignMutation.mutateAsync({
										id: loan.id,
										stageType,
									});
								} catch (error) {
									toast({
										title: "Assignment failed",
										description: parseApiError(error).message,
										variant: "destructive",
									});
								}
							}}
						>
							Assign to me
						</Button>
					);
				},
			},
			{
				id: "shares",
				header: "Shares",
				accessor: (loan) => loan.shares_to_exercise ?? 0,
				cell: (loan) => loan.shares_to_exercise ?? "—",
			},
			{
				id: "loanPrincipal",
				header: "Loan principal",
				accessor: (loan) => loan.loan_principal ?? "",
				cell: (loan) => formatCurrency(loan.loan_principal),
			},
			{
				id: "createdAt",
				header: "Created",
				accessor: (loan) => loan.created_at,
				cell: (loan) => formatDate(loan.created_at),
			},
			{
				id: "updatedAt",
				header: "Updated",
				accessor: (loan) => loan.updated_at,
				cell: (loan) => formatDate(loan.updated_at),
			},
		],
		[assignMutation, can, toast]
	);

	const initialColumnVisibility: VisibilityState = {
		applicantEmail: false,
		updatedAt: false,
		assignedAt: false,
	};

	if (visibleTabs.length === 0) {
		return (
			<PageContainer className="space-y-6">
				<PageHeader
					title="Workflow queue"
					subtitle="Review stock loan requests by discipline."
				/>
				<EmptyState
					title="No workflow access"
					message="You don't have queue permissions yet. Contact an administrator if this is unexpected."
				/>
			</PageContainer>
		);
	}

	if (activeQuery.isError) {
		return (
			<PageContainer className="space-y-6">
				<PageHeader
					title="Workflow queue"
					subtitle="Review stock loan requests by discipline."
				/>
				<EmptyState
					title="Unable to load workflow queue"
					message="We couldn't fetch queue requests right now."
					actionLabel="Retry"
					onRetry={() => activeQuery.refetch()}
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Workflow queue"
				subtitle="Review stock loan requests by discipline."
			/>

			<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
				{visibleTabs.map((tab) => (
					<TabButton
						key={tab.id}
						label={tab.label}
						value={tab.id}
						active={tab.id === activeTab}
						onSelect={(value) => setSelectedTab(value)}
					/>
				))}
			</div>

			<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
				{QUEUE_SCOPE_OPTIONS.map((option) => (
					<TabButton
						key={option.id}
						label={option.label}
						value={option.id}
						active={option.id === queueScope}
						onSelect={(value) => setQueueScope(value)}
					/>
				))}
			</div>

			<div className="rounded-lg border bg-card p-4">
				<h2 className="text-base font-semibold text-foreground">
					{activeCopy?.label} queue
				</h2>
				<p className="text-sm text-muted-foreground">
					{activeCopy?.description}
				</p>
			</div>

			<DataTable
				data={loans}
				columns={columns}
				getRowId={(loan) => loan.id}
				isLoading={activeQuery.isLoading}
				emptyMessage="No workflow requests in this queue yet."
				enableExport={false}
				enableRowSelection
				className="flex-1 min-h-0"
				preferences={preferencesConfig}
				initialColumnVisibility={initialColumnVisibility}
				renderToolbarActions={(selectedLoans) => {
					const hasSingle = selectedLoans.length === 1;
					const selectedLoan = hasSingle ? selectedLoans[0] : null;
					return (
						<div className="flex items-center gap-2">
							<ToolbarButton
								variant="outline"
								size="sm"
								disabled={!hasSingle}
								onClick={() => {
									if (!selectedLoan) return;
									navigate(
										routes.workflowsRequestDetail.replace(
											":requestId",
											selectedLoan.id
										)
									);
								}}
							>
								View
							</ToolbarButton>
							{canAssignAny ? (
								<ToolbarButton
									variant="secondary"
									size="sm"
									disabled={!hasSingle}
									onClick={() => {
										if (!selectedLoan) return;
										setAssignmentTarget(selectedLoan);
										setAssignDialogOpen(true);
									}}
								>
									Assign
								</ToolbarButton>
							) : null}
						</div>
					);
				}}
				pagination={{
					enabled: true,
					pageSize: preferredPageSize,
					pageSizeOptions: PAGE_SIZE_OPTIONS,
				}}
			/>
			<Dialog
				open={assignDialogOpen}
				onOpenChange={(open) => {
					setAssignDialogOpen(open);
					if (!open) {
						setUserSearchTerm("");
						setSelectedAssigneeId("");
						setAssignmentTarget(null);
					}
				}}
			>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>Assign workflow</DialogTitle>
					</DialogHeader>
					<div className="space-y-3 text-sm">
						<p className="text-muted-foreground">
							Assign{" "}
							<span className="font-medium text-foreground">
								{assignmentTarget?.id ?? "this loan"}
							</span>{" "}
							to a reviewer.
						</p>
						<Input
							value={userSearchTerm}
							onChange={(event) => setUserSearchTerm(event.target.value)}
							placeholder="Search user by name, email, or employee ID"
						/>
						<div className="space-y-2 max-h-64 overflow-auto rounded-md border p-2">
							{userSearchTerm.trim().length === 0 ? (
								<p className="text-xs text-muted-foreground">
									Start typing to find users.
								</p>
							) : usersQuery.isLoading ? (
								<p className="text-xs text-muted-foreground">Loading users…</p>
							) : assigneeOptions.length === 0 ? (
								<p className="text-xs text-muted-foreground">No users found.</p>
							) : (
								assigneeOptions.map((option) => {
									const displayName =
										option.user.full_name ||
										[option.user.first_name, option.user.last_name]
											.filter(Boolean)
											.join(" ")
											.trim() ||
										option.user.email;
									return (
										<button
											type="button"
											key={option.user.id}
											className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition ${
												selectedAssigneeId === option.user.id
													? "bg-muted"
													: "hover:bg-muted/40"
											}`}
											onClick={() => setSelectedAssigneeId(option.user.id)}
										>
											<span className="font-medium text-foreground">
												{displayName}
											</span>
											<span className="text-xs text-muted-foreground">
												{option.user.email}
											</span>
										</button>
									);
								})
							)}
						</div>
					</div>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setAssignDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							disabled={
								!assignmentTarget ||
								!selectedAssigneeId ||
								assignmentTarget?.current_stage_status === "COMPLETED" ||
								assignMutation.isPending
							}
							onClick={async () => {
								if (!assignmentTarget || !selectedAssigneeId) return;
								const stageType = assignmentTarget.current_stage_type;
								if (!stageType) return;
								try {
									await assignMutation.mutateAsync({
										id: assignmentTarget.id,
										stageType,
										payload: { assignee_user_id: selectedAssigneeId },
									});
									setAssignDialogOpen(false);
									setUserSearchTerm("");
									setSelectedAssigneeId("");
								} catch (error) {
									toast({
										title: "Assignment failed",
										description: parseApiError(error).message,
										variant: "destructive",
									});
								}
							}}
						>
							{assignMutation.isPending ? "Assigning..." : "Assign"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
