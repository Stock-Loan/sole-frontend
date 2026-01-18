import type { OrgDocumentFolder, OrgDocumentTemplate } from "@/entities/document/types";
import type {
	OrgDocumentFolderValues,
	OrgDocumentTemplateUploadValues,
} from "@/entities/document/schemas";

export interface OrgDocumentFolderListProps {
	folders: OrgDocumentFolder[];
	selectedFolderId?: string | null;
	onSelect: (folderId: string | null) => void;
	onCreate: () => void;
	onRename: (folder: OrgDocumentFolder) => void;
	onDelete: (folder: OrgDocumentFolder) => void;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	canManage?: boolean;
}

export interface OrgDocumentFileGridProps {
	templates: OrgDocumentTemplate[];
	selectedTemplateId?: string | null;
	onSelect: (template: OrgDocumentTemplate | null) => void;
	isLoading?: boolean;
	isError?: boolean;
	onRetry?: () => void;
	onDownload: (template: OrgDocumentTemplate) => void;
	onDelete: (template: OrgDocumentTemplate) => void;
	folderNameById?: Record<string, string>;
	canManage?: boolean;
}

export interface OrgDocumentTemplateInfoDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	template: OrgDocumentTemplate;
	folderName?: string;
}

export interface OrgDocumentFolderDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	mode: "create" | "rename";
	initialValues?: OrgDocumentFolderValues | null;
	onSubmit: (values: OrgDocumentFolderValues) => Promise<void> | void;
	isSubmitting?: boolean;
}

export interface OrgDocumentTemplateUploadDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	folders: OrgDocumentFolder[];
	onSubmit: (values: OrgDocumentTemplateUploadValues) => Promise<void> | void;
	isSubmitting?: boolean;
	defaultFolderId?: string | null;
}
