import type { ReactNode } from "react";
import type {
	LoanAllocationItem,
	LoanApplication,
	LoanApplicationStatus,
	LoanApplicationSummary,
	LoanDocumentCreatePayload,
	LoanDocumentGroup,
	LoanDocumentUploadPayload,
	LoanRepayment,
	LoanScheduleResponse,
	LoanSelectionMode,
	LoanWorkflowStage,
	LoanWorkflowStageStatus,
	LoanWorkflowStageType,
	LoanWorkflowStageUpdatePayload,
} from "@/entities/loan/types";
import type { StockSummary } from "@/entities/stock-grant/types";

export interface LoanStatusBadgeProps {
	status: LoanApplicationSummary["status"];
	className?: string;
}

export interface LoanDetailContentProps {
	loan?: LoanApplication | null;
	isLoading: boolean;
	isError: boolean;
	onRetry?: () => void;
	emptyTitle?: string;
	emptyMessage?: string;
}

export interface LoanSelfDetailContentProps {
	loan?: LoanApplication | null;
	isLoading: boolean;
	isError: boolean;
	onRetry?: () => void;
	emptyTitle?: string;
	emptyMessage?: string;
	documentGroups?: LoanDocumentGroup[];
	documentsLoading?: boolean;
	documentsError?: boolean;
	onDocumentsRetry?: () => void;
	canViewDocuments?: boolean;
}

export interface LoanDetailSummaryCardProps {
	label: string;
	value?: string | null;
}

export type LoanDetailValue = string | number | null | undefined;
export type LoanSelectionValue = string | null | undefined;

export interface LoanDetailRowProps {
	label: string;
	value?: LoanDetailValue;
	valueClassName?: string;
}

export interface LoanSelectionSnapshotProps {
	selectionMode?: LoanSelectionMode | null;
	selectionValue?: string | null;
}

export interface LoanAllocationTableProps {
	allocations: LoanAllocationItem[];
}

export interface LoanTimelineProps {
	stages?: LoanWorkflowStage[];
	activationDate?: string | null;
	election83bDueDate?: string | null;
	loanStatus?: LoanApplicationStatus | null;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	emptyTitle?: string;
	emptyMessage?: string;
}

export interface LoanDocumentListProps {
	groups: LoanDocumentGroup[];
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	emptyTitle?: string;
	emptyMessage?: string;
	onDownload?: (document: LoanDocument) => void;
	downloadingDocumentId?: string | null;
}

export interface StageStatusBadgeProps {
	status: LoanWorkflowStageStatus;
	className?: string;
}

export interface LoanDocumentTypeOption {
	value: string;
	label: string;
}

export interface LoanSummaryMetric {
	label: string;
	value: string;
	helper?: string;
}

export interface LoanSummaryMetricGridProps {
	metrics: LoanSummaryMetric[];
}

export interface LoanSummaryBarItem {
	label: string;
	value: number;
	color?: string;
	helper?: string;
}

export interface LoanSummaryBarListProps {
	title: string;
	items: LoanSummaryBarItem[];
	total?: number;
	emptyMessage?: string;
}

export interface LoanSummaryBarChartProps {
	title: string;
	items: LoanSummaryBarItem[];
	total?: number;
	emptyMessage?: string;
}

export interface LoanSummaryPieChartProps {
	title: string;
	items: LoanSummaryBarItem[];
	total?: number;
	emptyMessage?: string;
}

export interface LoanSchedulePanelProps {
	schedule?: LoanScheduleResponse | null;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	actions?: ReactNode;
}

export interface LoanRepaymentsPanelProps {
	repayments?: LoanRepayment[];
	total?: number;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
}

export type LoanDetailTab = "overview" | "repayments" | "schedule";

export interface LoanDetailTabOption {
	id: LoanDetailTab;
	label: string;
}

export interface WorkflowStagePanelProps {
	title: string;
	description?: string;
	stageType: LoanWorkflowStageType;
	stage?: LoanWorkflowStage | null;
	assigneeName?: string | null;
	documentGroups: LoanDocumentGroup[];
	requiredDocumentTypes: string[];
	documentTypeOptions: LoanDocumentTypeOption[];
	onUploadDocument: (payload: LoanDocumentUploadPayload) => Promise<unknown>;
	onUpdateStage: (payload: LoanWorkflowStageUpdatePayload) => Promise<unknown>;
	isRegistering?: boolean;
	isUpdating?: boolean;
	disableDocumentForm?: boolean;
}

export interface PostIssuancePanelProps {
	stage?: LoanWorkflowStage | null;
	documentGroups: LoanDocumentGroup[];
	onUploadDocument: (payload: LoanDocumentUploadPayload) => Promise<unknown>;
	isRegistering?: boolean;
	disableDocumentForm?: boolean;
}

export interface Loan83bPanelProps {
	loanId: string;
	dueDate?: string | null;
	daysUntilDue?: number | null;
	onRegister: (payload: LoanDocumentCreatePayload) => Promise<unknown>;
	isRegistering?: boolean;
}

export interface LoanWorkflowSummaryProps {
	loan: LoanApplication;
	stockSummary?: StockSummary | null;
}
