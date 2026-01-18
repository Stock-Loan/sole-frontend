import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { downloadBlob } from "@/shared/lib/download";
import { usePermissions } from "@/auth/hooks";
import { AppDialog } from "@/shared/ui/Dialog/dialog";
import {
	useCreateOrgDocumentFolder,
	useDeleteOrgDocumentFolder,
	useDeleteOrgDocumentTemplate,
	useDownloadOrgDocumentTemplate,
	useOrgDocumentFolders,
	useOrgDocumentTemplates,
	useUpdateOrgDocumentFolder,
	useUploadOrgDocumentTemplate,
} from "@/entities/document/hooks";
import { OrgDocumentFolderList } from "@/entities/document/components/OrgDocumentFolderList";
import { OrgDocumentFileGrid } from "@/entities/document/components/OrgDocumentFileGrid";
import { OrgDocumentTemplateDetailCard } from "@/entities/document/components/OrgDocumentTemplateDetailCard";
import { OrgDocumentFolderDialog } from "@/entities/document/components/OrgDocumentFolderDialog";
import { OrgDocumentTemplateUploadDialog } from "@/entities/document/components/OrgDocumentTemplateUploadDialog";
import type { OrgDocumentFolder, OrgDocumentTemplate } from "@/entities/document/types";

export function TemplatesPage() {
	const { can } = usePermissions();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const canView = can("org.document.view");
	const canManage = can("org.document.manage");

	const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
	const [folderDialogOpen, setFolderDialogOpen] = useState(false);
	const [folderDialogMode, setFolderDialogMode] = useState<"create" | "rename">(
		"create"
	);
	const [folderToEdit, setFolderToEdit] = useState<OrgDocumentFolder | null>(
		null
	);
	const [folderToDelete, setFolderToDelete] = useState<OrgDocumentFolder | null>(
		null
	);
	const [templateToDelete, setTemplateToDelete] = useState<OrgDocumentTemplate | null>(
		null
	);
	const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
	const [selectedTemplate, setSelectedTemplate] =
		useState<OrgDocumentTemplate | null>(null);

	const foldersQuery = useOrgDocumentFolders(canView);
	const folders = foldersQuery.data?.items ?? [];

	const templatesQuery = useOrgDocumentTemplates(
		{ folder_id: selectedFolderId ?? undefined },
		{ enabled: canView }
	);
	const templates = templatesQuery.data?.items ?? [];

	useEffect(() => {
		if (!selectedFolderId) return;
		const exists = folders.some((folder) => folder.id === selectedFolderId);
		if (!exists) {
			setSelectedFolderId(null);
		}
	}, [folders, selectedFolderId]);

	useEffect(() => {
		if (!selectedTemplate) return;
		const exists = templates.some((template) => template.id === selectedTemplate.id);
		if (!exists) {
			setSelectedTemplate(null);
		}
	}, [selectedTemplate, templates]);

	const folderNameById = useMemo(() => {
		return folders.reduce<Record<string, string>>((acc, folder) => {
			acc[folder.id] = folder.name;
			return acc;
		}, {});
	}, [folders]);

	const createFolderMutation = useCreateOrgDocumentFolder({
		onSuccess: (folder) => {
			toast({ title: "Folder created" });
			setSelectedFolderId(folder.id);
			setFolderDialogOpen(false);
		},
		onError: (error) => apiErrorToast(error, "Unable to create folder."),
	});

	const updateFolderMutation = useUpdateOrgDocumentFolder({
		onSuccess: () => {
			toast({ title: "Folder updated" });
			setFolderDialogOpen(false);
		},
		onError: (error) => apiErrorToast(error, "Unable to update folder."),
	});

	const deleteFolderMutation = useDeleteOrgDocumentFolder({
		onSuccess: () => {
			toast({ title: "Folder deleted" });
			if (folderToDelete?.id === selectedFolderId) {
				setSelectedFolderId(null);
			}
			setFolderToDelete(null);
		},
		onError: (error) => apiErrorToast(error, "Unable to delete folder."),
	});

	const uploadTemplateMutation = useUploadOrgDocumentTemplate({
		onSuccess: () => {
			toast({ title: "Template uploaded" });
			setUploadDialogOpen(false);
		},
		onError: (error) => apiErrorToast(error, "Unable to upload template."),
	});

	const deleteTemplateMutation = useDeleteOrgDocumentTemplate({
		onSuccess: () => {
			toast({ title: "Template deleted" });
			setTemplateToDelete(null);
		},
		onError: (error) => apiErrorToast(error, "Unable to delete template."),
	});

	const downloadTemplateMutation = useDownloadOrgDocumentTemplate({
		onSuccess: (blob, templateId) => {
			const template = templates.find((item) => item.id === templateId);
			downloadBlob(blob, template?.file_name ?? "template");
		},
		onError: (error) => apiErrorToast(error, "Unable to download template."),
	});

	const handleCreateFolder = () => {
		setFolderDialogMode("create");
		setFolderToEdit(null);
		setFolderDialogOpen(true);
	};

	const handleRenameFolder = (folder: OrgDocumentFolder) => {
		setFolderDialogMode("rename");
		setFolderToEdit(folder);
		setFolderDialogOpen(true);
	};

	const handleDeleteFolder = (folder: OrgDocumentFolder) => {
		setFolderToDelete(folder);
	};

	const handleDownloadTemplate = (template: OrgDocumentTemplate) => {
		downloadTemplateMutation.mutate(template.id);
	};

	const handleDeleteTemplate = (template: OrgDocumentTemplate) => {
		setTemplateToDelete(template);
	};

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-6">
			<PageHeader
				title="Templates"
				subtitle="Manage organization templates by folder."
			/>
			{!canView ? (
				<EmptyState
					title="Templates unavailable"
					message="You do not have permission to view document templates."
				/>
			) : (
				<div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-[260px,minmax(0,1fr)]">
					<OrgDocumentFolderList
						folders={folders}
						selectedFolderId={selectedFolderId}
						onSelect={setSelectedFolderId}
						onCreate={handleCreateFolder}
						onRename={handleRenameFolder}
						onDelete={handleDeleteFolder}
						isLoading={foldersQuery.isLoading}
						isError={foldersQuery.isError}
						onRetry={() => foldersQuery.refetch()}
						canManage={canManage}
					/>
					<div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
						<div className="flex flex-wrap items-center justify-between gap-3">
							<div>
								<p className="text-sm font-semibold text-foreground">
									{selectedFolderId
										? folderNameById[selectedFolderId] ?? "Folder"
										: "All templates"}
								</p>
								<p className="text-xs text-muted-foreground">
									{templates.length} template{templates.length === 1 ? "" : "s"}
								</p>
							</div>
							{canManage ? (
								<Button
									variant="default"
									size="sm"
									onClick={() => setUploadDialogOpen(true)}
								>
									Upload template
								</Button>
							) : null}
						</div>

						{selectedTemplate ? (
							<OrgDocumentTemplateDetailCard
								template={selectedTemplate}
								folderName={
									folderNameById[selectedTemplate.folder_id ?? ""] ??
									"General"
								}
								onClose={() => setSelectedTemplate(null)}
								onDownload={handleDownloadTemplate}
								onDelete={handleDeleteTemplate}
								canManage={canManage}
							/>
						) : null}

						<OrgDocumentFileGrid
							templates={templates}
							selectedTemplateId={selectedTemplate?.id ?? null}
							onSelect={(template) => setSelectedTemplate(template)}
							isLoading={templatesQuery.isLoading}
							isError={templatesQuery.isError}
							onRetry={() => templatesQuery.refetch()}
							onDownload={handleDownloadTemplate}
							onDelete={handleDeleteTemplate}
							folderNameById={folderNameById}
							canManage={canManage}
						/>
					</div>
				</div>
			)}

			<OrgDocumentFolderDialog
				open={folderDialogOpen}
				onOpenChange={setFolderDialogOpen}
				mode={folderDialogMode}
				initialValues={
					folderDialogMode === "rename" && folderToEdit
						? { name: folderToEdit.name }
						: null
				}
				onSubmit={async (values) => {
					if (folderDialogMode === "create") {
						await createFolderMutation.mutateAsync(values);
						return;
					}
					if (!folderToEdit) return;
					await updateFolderMutation.mutateAsync({
						folderId: folderToEdit.id,
						payload: values,
					});
				}}
				isSubmitting={
					createFolderMutation.isPending || updateFolderMutation.isPending
				}
			/>

			<OrgDocumentTemplateUploadDialog
				open={uploadDialogOpen}
				onOpenChange={setUploadDialogOpen}
				folders={folders}
				defaultFolderId={selectedFolderId}
				isSubmitting={uploadTemplateMutation.isPending}
				onSubmit={async (values) => {
					if (!values.file) return;
					await uploadTemplateMutation.mutateAsync({
						file: values.file,
						folder_id: values.folder_id ?? undefined,
						name: values.name || undefined,
						description: values.description || undefined,
					});
				}}
			/>

			<AppDialog
				open={Boolean(folderToDelete)}
				onOpenChange={(open) => {
					if (!open) setFolderToDelete(null);
				}}
				title="Delete folder"
				description="This will permanently remove the folder. Only empty folders can be deleted."
				size="sm"
				actions={[
					{
						label: "Delete folder",
						variant: "destructive",
						onClick: () => {
							if (!folderToDelete) return;
							deleteFolderMutation.mutate({ folderId: folderToDelete.id });
						},
						loading: deleteFolderMutation.isPending,
					},
				]}
			>
				<p className="text-sm text-muted-foreground">
					{folderToDelete
						? `You're about to delete "${folderToDelete.name}".`
						: ""}
				</p>
			</AppDialog>

			<AppDialog
				open={Boolean(templateToDelete)}
				onOpenChange={(open) => {
					if (!open) setTemplateToDelete(null);
				}}
				title="Delete template"
				description="This will permanently remove the template."
				size="sm"
				actions={[
					{
						label: "Delete template",
						variant: "destructive",
						onClick: () => {
							if (!templateToDelete) return;
							deleteTemplateMutation.mutate({
								templateId: templateToDelete.id,
							});
						},
						loading: deleteTemplateMutation.isPending,
					},
				]}
			>
				<p className="text-sm text-muted-foreground">
					{templateToDelete
						? `You're about to delete "${templateToDelete.name}".`
						: ""}
				</p>
			</AppDialog>
		</PageContainer>
	);
}
