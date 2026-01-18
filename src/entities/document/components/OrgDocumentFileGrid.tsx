import { FileText, Trash2, Download } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { cn } from "@/shared/lib/utils";
import { formatDate } from "@/shared/lib/format";
import type { OrgDocumentFileGridProps } from "@/entities/document/components/types";

export function OrgDocumentFileGrid({
	templates,
	selectedTemplateId,
	onSelect,
	isLoading,
	isError,
	onRetry,
	onDownload,
	onDelete,
	folderNameById,
	canManage = false,
}: OrgDocumentFileGridProps) {
	if (isLoading) {
		return (
			<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<Skeleton key={`doc-file-skel-${index}`} className="h-36 w-full" />
				))}
			</div>
		);
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load templates"
				message="We couldn't fetch document templates."
				actionLabel="Retry"
				onRetry={onRetry}
			/>
		);
	}

	if (templates.length === 0) {
		return (
			<EmptyState
				title="No templates yet"
				message="Upload documents to build your template library."
			/>
		);
	}

	return (
		<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{templates.map((template) => {
				const isSelected = template.id === selectedTemplateId;
				const folderName =
					folderNameById?.[template.folder_id ?? ""] ?? "General";
				return (
					<button
						key={template.id}
						type="button"
						onClick={() => onSelect(template)}
						className={cn(
							"flex h-full flex-col justify-between rounded-xl border px-4 py-3 text-left transition shadow-sm",
							isSelected
								? "border-primary/50 bg-primary/5"
								: "border-border/60 bg-background hover:border-primary/30 hover:bg-muted/40"
						)}
					>
						<div className="space-y-2">
							<div className="flex items-center justify-between gap-3">
								<div className="min-w-0">
									<p className="truncate text-sm font-semibold text-foreground">
										{template.name}
									</p>
									<p className="truncate text-xs text-muted-foreground">
										{template.file_name}
									</p>
								</div>
								<div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/60">
									<FileText className="h-5 w-5 text-muted-foreground" />
								</div>
							</div>
							<p className="line-clamp-2 text-xs text-muted-foreground">
								{template.description ?? "No description provided."}
							</p>
						</div>
						<div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
							<span>{folderName}</span>
							<span>{formatDate(template.created_at)}</span>
						</div>
						<div className="mt-3 flex items-center gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="h-8 px-3 text-xs"
								onClick={(event) => {
									event.stopPropagation();
									onDownload(template);
								}}
							>
								<Download className="mr-2 h-3.5 w-3.5" />
								Download
							</Button>
							{canManage ? (
								<Button
									type="button"
									variant="ghost"
									size="sm"
									className="h-8 px-3 text-xs text-destructive"
									onClick={(event) => {
										event.stopPropagation();
										onDelete(template);
									}}
								>
									<Trash2 className="mr-2 h-3.5 w-3.5" />
									Delete
								</Button>
							) : null}
						</div>
					</button>
				);
			})}
		</div>
	);
}
