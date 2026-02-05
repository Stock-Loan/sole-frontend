import { FileText } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Button } from "@/shared/ui/Button";
import { formatDate } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import { sanitizeExternalUrl } from "@/shared/lib/urls";
import type { LoanDocumentListProps } from "@/entities/loan/types";

export function LoanDocumentList({
	groups,
	isLoading,
	isError,
	onRetry,
	emptyTitle = "No documents yet",
	emptyMessage = "Documents will appear here once they are registered.",
	onDownload,
	downloadingDocumentId,
}: LoanDocumentListProps) {
	if (isLoading) {
		return <LoadingState label="Loading documents..." />;
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load documents"
				message="Please try again."
				onRetry={onRetry}
			/>
		);
	}

	const visibleGroups = groups.filter((group) => group.documents.length > 0);

	if (visibleGroups.length === 0) {
		return <EmptyState title={emptyTitle} message={emptyMessage} />;
	}

	return (
		<div className="space-y-4">
			{visibleGroups.map((group) => (
				<div
					key={group.stage_type}
					className="space-y-2 rounded-lg border border-border/60 p-3"
				>
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						{normalizeDisplay(group.stage_type)}
					</p>
					<div className="space-y-2">
						{group.documents.map((doc) => {
							const link = doc.storage_path_or_url ?? doc.storage_url;
							const safeLink = sanitizeExternalUrl(link);
							const canLink = Boolean(safeLink);
							const canDownload = Boolean(onDownload && doc.id);
							const isDownloading =
								downloadingDocumentId && doc.id
									? downloadingDocumentId === doc.id
									: false;
							return (
								<div
									key={doc.id ?? `${group.stage_type}-${doc.file_name}`}
									className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-muted/30 px-3 py-2 text-sm"
								>
									<div className="min-w-[160px] space-y-1">
										<p className="font-medium text-foreground">
											{doc.file_name ?? "Untitled document"}
										</p>
										<p className="text-xs text-muted-foreground">
											{normalizeDisplay(doc.document_type ?? "Document")}
										</p>
									</div>
									<div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
										{doc.uploaded_at ? (
											<span>Uploaded {formatDate(doc.uploaded_at)}</span>
										) : null}
										{canDownload ? (
											<Button
												variant="ghost"
												size="sm"
												className="h-7 px-2 text-xs"
												disabled={isDownloading}
												onClick={() => onDownload?.(doc)}
											>
												<FileText className="mr-1 h-3.5 w-3.5" />
												{isDownloading ? "Downloading..." : "Download"}
											</Button>
										) : null}
										{canLink ? (
											<Button
												asChild
												variant="ghost"
												size="sm"
												className="h-7 px-2 text-xs"
											>
												<a
													href={safeLink ?? undefined}
													target="_blank"
													rel="noreferrer"
												>
													<FileText className="mr-1 h-3.5 w-3.5" />
													View
												</a>
											</Button>
										) : null}
									</div>
								</div>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
