import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import { formatDate } from "@/shared/lib/format";
import type { OrgDocumentTemplateInfoDialogProps } from "@/entities/document/components/types";

export function OrgDocumentTemplateInfoDialog({
	open,
	onOpenChange,
	template,
	folderName,
}: OrgDocumentTemplateInfoDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>Template details</DialogTitle>
					<DialogDescription>
						View template information and metadata.
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="space-y-4 text-sm text-muted-foreground">
					<div className="space-y-1">
						<p className="text-xs uppercase tracking-wide text-muted-foreground">
							Name
						</p>
						<p className="text-sm font-semibold text-foreground">
							{template.name}
						</p>
						<p className="text-xs text-muted-foreground">
							{template.file_name}
						</p>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<div>
							<p className="text-xs uppercase tracking-wide text-muted-foreground">
								Folder
							</p>
							<p className="text-sm text-foreground">
								{folderName ?? "General"}
							</p>
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
								{template.uploaded_by_name ??
									template.uploaded_by_user_id ??
									"—"}
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
				</DialogBody>
				<DialogFooter>
					<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
