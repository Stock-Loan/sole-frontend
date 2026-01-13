import type {
	LoanAllocationItem,
	LoanApplication,
	LoanApplicationSummary,
	LoanDocument,
	LoanSelectionMode,
	LoanWorkflowStage,
} from "@/entities/loan/types";

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

export interface LoanWorkflowStagesProps {
	stages: LoanWorkflowStage[];
}

export interface LoanDocumentsListProps {
	documents: LoanDocument[];
}

export interface LoanSelfWorkflowStagesProps {
	stages: LoanWorkflowStage[];
}

export interface LoanSelfDocumentsListProps {
	documents: LoanDocument[];
}
