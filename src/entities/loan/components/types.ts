import type {
	LoanAllocationItem,
	LoanApplication,
	LoanApplicationSummary,
	LoanDocumentCreatePayload,
	LoanDocumentGroup,
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
}

export interface StageStatusBadgeProps {
	status: LoanWorkflowStageStatus;
	className?: string;
}

export interface LoanDocumentTypeOption {
	value: string;
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
	onRegisterDocument: (payload: LoanDocumentCreatePayload) => Promise<unknown>;
	onUpdateStage: (payload: LoanWorkflowStageUpdatePayload) => Promise<unknown>;
	isRegistering?: boolean;
	isUpdating?: boolean;
	disableDocumentForm?: boolean;
}

export interface PostIssuancePanelProps {
	stage?: LoanWorkflowStage | null;
	documentGroups: LoanDocumentGroup[];
	onRegisterDocument: (payload: LoanDocumentCreatePayload) => Promise<unknown>;
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
