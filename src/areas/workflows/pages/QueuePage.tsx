import { useMemo, useState } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import { Link, useNavigate } from "react-router-dom";
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
import { AppDialog } from "@/shared/ui/Dialog/dialog";
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
import { useRolesList, useRoleMembersSearch } from "@/entities/role/hooks";
import type { OrgUserListItem } from "@/entities/user/types";

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

function getRoleNameForStage(stageType?: LoanWorkflowStageType | null) {
	if (stageType === "HR_REVIEW") return "HR";
	if (stageType === "FINANCE_PROCESSING") return "FINANCE";
	if (stageType === "LEGAL_EXECUTION") return "LEGAL";
	return null;
}

function getUserDisplayName(user: OrgUserListItem["user"]) {
	return (
		user.full_name ||
		[user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
		user.email
	);
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
	const [selectionResetKey, setSelectionResetKey] = useState(0);
	const rolesQuery = useRolesList({}, { enabled: assignDialogOpen });
	const assignmentStageType = assignmentTarget?.current_stage_type ?? null;
	const roleIdsByName = useMemo(() => {
		const map = new Map<string, string>();
		(rolesQuery.data?.items ?? []).forEach((role) => {
			map.set(role.name.toUpperCase(), role.id);
		});
		return map;
	}, [rolesQuery.data?.items]);
	const stageRoleId = useMemo(() => {
		const stageRoleName = getRoleNameForStage(assignmentStageType);
		if (!stageRoleName) return null;
		return roleIdsByName.get(stageRoleName) ?? null;
	}, [assignmentStageType, roleIdsByName]);
	const usersQuery = useRoleMembersSearch(
		stageRoleId,
		userSearchTerm.trim(),
		userSearchTerm,
		{
			enabled:
				assignDialogOpen &&
				userSearchTerm.trim().length > 0 &&
				Boolean(stageRoleId),
		}
	);
	const assigneeOptions = useMemo(
		() => usersQuery.data?.items ?? [],
		[usersQuery.data]
	);
	const sortedAssignees = useMemo(() => {
		const items = [...assigneeOptions];
		items.sort((a, b) => {
			const aIsMe = a.user.id === user?.id;
			const bIsMe = b.user.id === user?.id;
			if (aIsMe && !bIsMe) return -1;
			if (!aIsMe && bIsMe) return 1;
			return getUserDisplayName(a.user).localeCompare(
				getUserDisplayName(b.user)
			);
		});
		return items;
	}, [assigneeOptions, user?.id]);

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
					const stageType = selectedLoan?.current_stage_type ?? null;
					const permission = getManagePermission(stageType);
					const canAssignSelf = permission ? can(permission) : false;
					const isCompleted =
						selectedLoan?.current_stage_status === "COMPLETED";
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
							{canAssignSelf ? (
								<ToolbarButton
									variant="secondary"
									size="sm"
									disabled={!hasSingle || isCompleted || !stageType}
									onClick={async () => {
										if (!selectedLoan || !stageType) return;
										try {
											await assignMutation.mutateAsync({
												id: selectedLoan.id,
												stageType,
											});
											setSelectionResetKey((prev) => prev + 1);
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
								</ToolbarButton>
							) : null}
							{canAssignAny ? (
								<ToolbarButton
									variant="outline"
									size="sm"
									disabled={!hasSingle}
									onClick={() => {
										if (!selectedLoan) return;
										setAssignmentTarget(selectedLoan);
										setAssignDialogOpen(true);
									}}
								>
									Assign reviewer
								</ToolbarButton>
							) : null}
						</div>
					);
				}}
				selectionResetKey={selectionResetKey}
				pagination={{
					enabled: true,
					pageSize: preferredPageSize,
					pageSizeOptions: PAGE_SIZE_OPTIONS,
				}}
			/>
			<AppDialog
				open={assignDialogOpen}
				onOpenChange={(open) => {
					setAssignDialogOpen(open);
					if (!open) {
						setUserSearchTerm("");
						setSelectedAssigneeId("");
						setAssignmentTarget(null);
					}
				}}
				title="Assign reviewer"
				description="Select a reviewer for this workflow stage."
				size="sm"
				actions={[
					{
						label: assignMutation.isPending ? "Assigning..." : "Assign",
						variant: "default",
						loading: assignMutation.isPending,
						disabled:
							!assignmentTarget ||
							!selectedAssigneeId ||
							assignmentTarget?.current_stage_status === "COMPLETED" ||
							assignMutation.isPending,
						onClick: async () => {
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
								setSelectionResetKey((prev) => prev + 1);
							} catch (error) {
								toast({
									title: "Assignment failed",
									description: parseApiError(error).message,
									variant: "destructive",
								});
							}
						},
					},
				]}
			>
				<div className="space-y-4">
					<div className="rounded-lg border border-border/70 bg-muted/20 px-4 py-3 text-sm">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-xs text-muted-foreground">Applicant</p>
								<p className="font-semibold text-foreground">
									{assignmentTarget?.applicant?.full_name ??
										assignmentTarget?.applicant?.email ??
										"—"}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Amount</p>
								<p className="font-semibold text-foreground">
									{formatCurrency(
										assignmentTarget?.loan_principal ??
											assignmentTarget?.purchase_price ??
											null
									)}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Stage</p>
								<p className="font-semibold text-foreground">
									{normalizeDisplay(assignmentStageType ?? "—")}
								</p>
							</div>
							<div>
								<p className="text-xs text-muted-foreground">Current assignee</p>
								<p className="font-semibold text-foreground">
									{assignmentTarget?.current_stage_assignee?.full_name ??
										assignmentTarget?.current_stage_assignee?.email ??
										"Unassigned"}
								</p>
							</div>
						</div>
						<p className="mt-2 text-xs text-muted-foreground">
							Only users with access to this queue are shown.
						</p>
					</div>

					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Select reviewer
						</p>
						<Input
							value={userSearchTerm}
							onChange={(event) => setUserSearchTerm(event.target.value)}
							placeholder="Search by name, email, or employee ID"
							className="h-9"
						/>
						<div className="max-h-72 space-y-2 overflow-auto rounded-lg border border-border/70 bg-background p-2">
							{userSearchTerm.trim().length === 0 ? (
								<p className="px-2 py-3 text-xs text-muted-foreground">
									Start typing to find eligible users.
								</p>
							) : rolesQuery.isLoading ? (
								<p className="px-2 py-3 text-xs text-muted-foreground">
									Loading role members…
								</p>
							) : rolesQuery.isError ? (
								<p className="px-2 py-3 text-xs text-muted-foreground">
									Unable to load roles for assignment.
								</p>
							) : !stageRoleId ? (
								<p className="px-2 py-3 text-xs text-muted-foreground">
									No role configured for this queue.
								</p>
							) : usersQuery.isLoading ? (
								<p className="px-2 py-3 text-xs text-muted-foreground">
									Loading users…
								</p>
							) : sortedAssignees.length === 0 ? (
								<p className="px-2 py-3 text-xs text-muted-foreground">
									No eligible users found for this queue.
								</p>
							) : (
								sortedAssignees.map((option) => {
									const displayName = getUserDisplayName(option.user);
									const isSelected = selectedAssigneeId === option.user.id;
									const isMe = option.user.id === user?.id;
									return (
										<button
											type="button"
											key={option.user.id}
											className={`flex w-full flex-col gap-1 rounded-md border px-3 py-2 text-left text-sm transition ${
												isSelected
													? "border-primary bg-primary/10"
													: "border-transparent hover:bg-muted/40"
											}`}
											onClick={() => setSelectedAssigneeId(option.user.id)}
										>
											<div className="flex items-center justify-between gap-2">
												<span className="font-medium text-foreground">
													{displayName}
												</span>
												{isMe ? (
													<span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
														You
													</span>
												) : null}
											</div>
											<span className="text-xs text-muted-foreground">
												{option.user.email}
											</span>
										</button>
									);
								})
							)}
						</div>
					</div>
				</div>
			</AppDialog>
		</PageContainer>
	);
}
