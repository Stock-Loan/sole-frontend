import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { TabButton } from "@/shared/ui/TabButton";
import { usePermissions } from "@/auth/hooks";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import { downloadBlob } from "@/shared/lib/download";
import { getOrgUserDisplayName } from "@/entities/user/constants";
import { LoanTimeline } from "@/entities/loan/components/loan-pages/LoanTimeline";
import { LoanDocumentList } from "@/entities/loan/components/loan-pages/LoanDocumentList";
import { LoanWorkflowSummary } from "@/entities/loan/components/workflow/LoanWorkflowSummary";
import { PostIssuancePanel } from "@/entities/loan/components/workflow/PostIssuancePanel";
import { WorkflowStagePanel } from "@/entities/loan/components/workflow/WorkflowStagePanel";
import {
	useFinanceLoanDetail,
	useHrLoanDetail,
	useLegalLoanDetail,
	useDownloadOrgLoanDocument,
	useOrgLoanDocuments,
	useUploadFinanceDocument,
	useUploadHrDocument,
	useUploadLegalDocument,
	useUploadLegalIssuanceDocument,
	useUpdateFinanceStage,
	useUpdateHrStage,
	useUpdateLegalStage,
} from "@/entities/loan/hooks";
import { useRolesList, useRoleMemberLookup } from "@/entities/role/hooks";
import type { LoanDocumentTypeOption } from "@/entities/loan/types";
import type { LoanDocument } from "@/entities/loan/types";

function getRoleNameForStage(stageType?: string | null) {
	if (stageType === "HR_REVIEW") return "HR";
	if (stageType === "FINANCE_PROCESSING") return "FINANCE";
	if (stageType === "LEGAL_EXECUTION") return "LEGAL";
	return null;
}

const HR_DOCUMENT_OPTIONS: LoanDocumentTypeOption[] = [
	{
		value: "NOTICE_OF_STOCK_OPTION_GRANT",
		label: "Notice of Stock Option Grant",
	},
	{
		value: "SPOUSE_PARTNER_CONSENT",
		label: "Spouse/partner consent",
	},
];

const FINANCE_DOCUMENT_OPTIONS: LoanDocumentTypeOption[] = [
	{
		value: "PAYMENT_INSTRUCTIONS",
		label: "Payment instructions",
	},
	{
		value: "PAYMENT_CONFIRMATION",
		label: "Payment confirmation",
	},
];

const LEGAL_DOCUMENT_OPTIONS: LoanDocumentTypeOption[] = [
	{
		value: "STOCK_OPTION_EXERCISE_AND_LOAN_AGREEMENT",
		label: "Stock option exercise & loan agreement",
	},
	{
		value: "SECURED_PROMISSORY_NOTE",
		label: "Secured promissory note",
	},
	{
		value: "STOCK_POWER_AND_ASSIGNMENT",
		label: "Stock power & assignment",
	},
	{
		value: "INVESTMENT_REPRESENTATION_STATEMENT",
		label: "Investment representation statement",
	},
];

const LEGAL_REQUIRED_DOCS = LEGAL_DOCUMENT_OPTIONS.map((doc) => doc.value);

export function RequestDetailPage() {
	const { requestId } = useParams();
	const { can } = usePermissions();
	const { toast } = useToast();

	const canViewHr = can("loan.queue.hr.view");
	const canViewFinance = can("loan.queue.finance.view");
	const canViewLegal = can("loan.queue.legal.view");
	const canManageHr = can("loan.workflow.hr.manage");
	const canManageFinance = can("loan.workflow.finance.manage");
	const canManageLegal = can("loan.workflow.legal.manage");
	const canManagePostIssuance = can("loan.workflow.post_issuance.manage");
	const canManageHrDocs = can("loan.document.manage_hr");
	const canManageFinanceDocs = can("loan.document.manage_finance");
	const canManageLegalDocs = can("loan.document.manage_legal");
	const canViewRoleMembers = can("role.view") && can("user.view");
	const canViewDocuments =
		can("loan.document.view") ||
		canManageHrDocs ||
		canManageFinanceDocs ||
		canManageLegalDocs;

	const viewTabs = useMemo(
		() =>
			[
				{ id: "hr", label: "HR", canView: canViewHr },
				{ id: "finance", label: "Finance", canView: canViewFinance },
				{ id: "legal", label: "Legal", canView: canViewLegal },
			].filter((tab) => tab.canView),
		[canViewFinance, canViewHr, canViewLegal],
	);
	const roleTabs = useMemo(
		() =>
			[
				{ id: "hr", label: "HR", canManage: canManageHr },
				{ id: "finance", label: "Finance", canManage: canManageFinance },
				{ id: "legal", label: "Legal", canManage: canManageLegal },
			].filter((tab) => tab.canManage),
		[canManageFinance, canManageHr, canManageLegal],
	);
	const [selectedTab, setSelectedTab] = useState("");
	const activeViewTab =
		viewTabs.find((tab) => tab.id === selectedTab)?.id ?? viewTabs[0]?.id ?? "";
	const activeActionTab =
		roleTabs.find((tab) => tab.id === selectedTab)?.id ?? roleTabs[0]?.id ?? "";

	const hrDetailQuery = useHrLoanDetail(requestId ?? "", {
		enabled: Boolean(requestId) && canViewHr && activeViewTab === "hr",
	});
	const financeDetailQuery = useFinanceLoanDetail(requestId ?? "", {
		enabled:
			Boolean(requestId) && canViewFinance && activeViewTab === "finance",
	});
	const legalDetailQuery = useLegalLoanDetail(requestId ?? "", {
		enabled: Boolean(requestId) && canViewLegal && activeViewTab === "legal",
	});

	const activeDetailQuery =
		activeViewTab === "finance"
			? financeDetailQuery
			: activeViewTab === "legal"
				? legalDetailQuery
				: hrDetailQuery;

	const loan = activeDetailQuery.data?.loan_application ?? null;
	const activeStage =
		activeViewTab === "finance"
			? financeDetailQuery.data?.finance_stage
			: activeViewTab === "legal"
				? legalDetailQuery.data?.legal_stage
				: hrDetailQuery.data?.hr_stage;
	const stockSummary = hrDetailQuery.data?.stock_summary ?? null;
	const rolesQuery = useRolesList(
		{},
		{
			enabled: Boolean(activeStage) && canViewRoleMembers,
		},
	);
	const roleIdsByName = useMemo(() => {
		const map = new Map<string, string>();
		(rolesQuery.data?.items ?? []).forEach((role) => {
			map.set(role.name.toUpperCase(), role.id);
		});
		return map;
	}, [rolesQuery.data?.items]);
	const stageRoleName = getRoleNameForStage(activeStage?.stage_type ?? null);
	const stageRoleId = useMemo(() => {
		if (!stageRoleName) return null;
		return roleIdsByName.get(stageRoleName) ?? null;
	}, [roleIdsByName, stageRoleName]);
	const fallbackAssigneeName =
		loan?.current_stage_assignee?.full_name ??
		loan?.current_stage_assignee?.email ??
		null;
	const roleMemberLookupQuery = useRoleMemberLookup(
		stageRoleId,
		activeStage?.assigned_to_user_id ?? null,
		{
			enabled:
				Boolean(stageRoleId) && canViewRoleMembers && !fallbackAssigneeName,
		},
	);
	const assigneeName = useMemo(() => {
		if (!activeStage?.assigned_to_user_id) return "Unassigned";
		if (fallbackAssigneeName) return fallbackAssigneeName;
		const member = roleMemberLookupQuery.data;
		if (!member) return "Assigned";
		return getOrgUserDisplayName(member.user);
	}, [
		activeStage?.assigned_to_user_id,
		fallbackAssigneeName,
		roleMemberLookupQuery.data,
	]);

	const documentsQuery = useOrgLoanDocuments(requestId ?? "", {
		enabled: Boolean(requestId) && canViewDocuments,
	});
	const documentGroups = documentsQuery.data?.groups ?? [];
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

	const updateHrStageMutation = useUpdateHrStage();
	const updateFinanceStageMutation = useUpdateFinanceStage();
	const updateLegalStageMutation = useUpdateLegalStage();
	const registerHrDocumentMutation = useUploadHrDocument();
	const registerFinanceDocumentMutation = useUploadFinanceDocument();
	const registerLegalDocumentMutation = useUploadLegalDocument();
	const registerLegalIssuanceDocumentMutation =
		useUploadLegalIssuanceDocument();
	const [downloadingDocumentId, setDownloadingDocumentId] = useState<
		string | null
	>(null);
	const downloadMutation = useDownloadOrgLoanDocument({
		onError: (error) => {
			toast({
				title: "Download failed",
				description: parseApiError(error).message,
				variant: "destructive",
			});
		},
	});

	if (!requestId) {
		return (
			<PageContainer className="space-y-4">
				<PageHeader title="Request detail" />
				<EmptyState
					title="Missing request ID"
					message="Select a request from the queue to review its details."
				/>
			</PageContainer>
		);
	}

	if (activeDetailQuery.isLoading) {
		return (
			<PageContainer className="space-y-4">
				<PageHeader
					title="Request detail"
					subtitle={`Request ID: ${requestId}`}
				/>
				<LoadingState label="Loading request details..." />
			</PageContainer>
		);
	}

	if (activeDetailQuery.isError || !loan) {
		return (
			<PageContainer className="space-y-4">
				<PageHeader
					title="Request detail"
					subtitle={`Request ID: ${requestId}`}
				/>
				<EmptyState
					title="Unable to load request"
					message="We couldn't fetch this request right now."
					actionLabel="Retry"
					onRetry={() => activeDetailQuery.refetch()}
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-6 pb-16">
			<PageHeader
				title="Request detail"
				subtitle={`Request ID: ${requestId}`}
			/>

			<LoanWorkflowSummary loan={loan} stockSummary={stockSummary} />

			<div className="grid gap-4 lg:grid-cols-2">
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Workflow timeline
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-sm text-muted-foreground">
						<LoanTimeline
							stages={loan.workflow_stages ?? []}
							activationDate={loan.activation_date}
							election83bDueDate={loan.election_83b_due_date}
							loanStatus={loan.status}
							emptyTitle="No workflow activity yet"
							emptyMessage="Workflow stages will appear once the request enters review."
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
								emptyTitle="No documents registered"
								emptyMessage="Documents will appear once reviewers register them."
								onDownload={handleDownload}
								downloadingDocumentId={downloadingDocumentId}
							/>
						) : (
							<p>You do not have permission to view documents.</p>
						)}
					</CardContent>
				</Card>
			</div>

			{loan.status === "ACTIVE" ? (
				<Card className="border-emerald-200 bg-emerald-50/60">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold text-emerald-700">
							Loan is active
						</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-emerald-700">
						The loan is now active. Post-issuance steps can begin.
					</CardContent>
				</Card>
			) : null}

			{roleTabs.length > 0 ? (
				<>
					<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
						{roleTabs.map((tab) => (
							<TabButton
								key={tab.id}
								label={tab.label}
								value={tab.id}
								active={tab.id === activeActionTab}
								onSelect={(value) => setSelectedTab(value)}
							/>
						))}
					</div>

					{activeActionTab === "finance" ? (
						<WorkflowStagePanel
							title="Finance review"
							description="Register payment documents and update the finance workflow stage."
							stageType="FINANCE_PROCESSING"
							stage={activeStage ?? null}
							assigneeName={assigneeName}
							documentGroups={documentGroups}
							requiredDocumentTypes={["PAYMENT_INSTRUCTIONS"]}
							documentTypeOptions={FINANCE_DOCUMENT_OPTIONS}
							onUploadDocument={(payload) =>
								registerFinanceDocumentMutation.mutateAsync({
									id: requestId,
									payload,
								})
							}
							onUpdateStage={(payload) =>
								updateFinanceStageMutation.mutateAsync({
									id: requestId,
									payload,
								})
							}
							isRegistering={registerFinanceDocumentMutation.isPending}
							isUpdating={updateFinanceStageMutation.isPending}
							disableDocumentForm={!canManageFinanceDocs}
						/>
					) : activeActionTab === "legal" ? (
						<div className="space-y-4">
							<WorkflowStagePanel
								title="Legal review"
								description="Register legal execution documents and update the legal workflow stage."
								stageType="LEGAL_EXECUTION"
								stage={activeStage ?? null}
								assigneeName={assigneeName}
								documentGroups={documentGroups}
								requiredDocumentTypes={LEGAL_REQUIRED_DOCS}
								documentTypeOptions={LEGAL_DOCUMENT_OPTIONS}
								onUploadDocument={(payload) =>
									registerLegalDocumentMutation.mutateAsync({
										id: requestId,
										payload,
									})
								}
								onUpdateStage={(payload) =>
									updateLegalStageMutation.mutateAsync({
										id: requestId,
										payload,
									})
								}
								isRegistering={registerLegalDocumentMutation.isPending}
								isUpdating={updateLegalStageMutation.isPending}
								disableDocumentForm={!canManageLegalDocs}
							/>
							{loan.status === "ACTIVE" ? (
								<PostIssuancePanel
									stage={
										loan.workflow_stages?.find(
											(stageItem) =>
												stageItem.stage_type === "LEGAL_POST_ISSUANCE",
										) ?? null
									}
									documentGroups={documentGroups}
									onUploadDocument={(payload) =>
										registerLegalIssuanceDocumentMutation.mutateAsync({
											id: requestId,
											payload,
										})
									}
									isRegistering={
										registerLegalIssuanceDocumentMutation.isPending
									}
									disableDocumentForm={!canManagePostIssuance}
								/>
							) : null}
						</div>
					) : (
						<WorkflowStagePanel
							title="HR review"
							description="Register HR documents and update the HR workflow stage."
							stageType="HR_REVIEW"
							stage={activeStage ?? null}
							assigneeName={assigneeName}
							documentGroups={documentGroups}
							requiredDocumentTypes={HR_DOCUMENT_OPTIONS.map(
								(doc) => doc.value,
							)}
							documentTypeOptions={HR_DOCUMENT_OPTIONS}
							onUploadDocument={(payload) =>
								registerHrDocumentMutation.mutateAsync({
									id: requestId,
									payload,
								})
							}
							onUpdateStage={(payload) =>
								updateHrStageMutation.mutateAsync({
									id: requestId,
									payload,
								})
							}
							isRegistering={registerHrDocumentMutation.isPending}
							isUpdating={updateHrStageMutation.isPending}
							disableDocumentForm={!canManageHrDocs}
						/>
					)}
				</>
			) : (
				<Card>
					<CardHeader className="pb-2">
						<CardTitle className="text-sm font-semibold">
							Reviewer actions
						</CardTitle>
					</CardHeader>
					<CardContent className="text-sm text-muted-foreground">
						You have view access to this request, but you do not have workflow
						permissions to update it.
					</CardContent>
				</Card>
			)}
		</PageContainer>
	);
}
