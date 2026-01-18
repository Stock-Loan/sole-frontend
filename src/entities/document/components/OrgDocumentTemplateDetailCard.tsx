import { Download, Trash2, X } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { formatDate } from "@/shared/lib/format";
import type { OrgDocumentTemplateDetailCardProps } from "@/entities/document/components/types";

export function OrgDocumentTemplateDetailCard({
	template,
	folderName,
	onClose,
	onDownload,
	onDelete,
	canManage = false,
}: OrgDocumentTemplateDetailCardProps) {
	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle className="text-sm font-semibold">Template details</CardTitle>
				<Button variant="ghost" size="icon" onClick={onClose}>
					<X className="h-4 w-4" />
				</Button>
			</CardHeader>
			<CardContent className="space-y-4 text-sm text-muted-foreground">
				<div className="space-y-1">
					<p className="text-xs uppercase tracking-wide text-muted-foreground">
						Name
					</p>
					<p className="text-sm font-semibold text-foreground">
						{template.name}
					</p>
					<p className="text-xs text-muted-foreground">{template.file_name}</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					<div>
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Folder
						</p>
						<p className="text-sm text-foreground">{folderName ?? "General"}</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Created
						</p>
						<p className="text-sm text-foreground">
							{formatDate(template.created_at)}
						</p>
					</div>
					<div>
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Uploaded by
						</p>
						<p className="text-sm text-foreground">
							{template.uploaded_by_user_id ?? "—"}
						</p>
					</div>
				</div>
				<div>
					<p className="text-xs uppercase tracking-wide text-muted-foreground">
						Description
					</p>
					<p className="text-sm text-foreground">
						{template.description ?? "No description provided."}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<Button
						variant="default"
						size="sm"
						onClick={() => onDownload(template)}
					>
						<Download className="mr-2 h-4 w-4" />
						Download
					</Button>
					{canManage ? (
						<Button
							variant="outline"
							size="sm"
							className="text-destructive"
							onClick={() => onDelete(template)}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Delete
						</Button>
					) : null}
				</div>
			</CardContent>
		</Card>
	);
}
