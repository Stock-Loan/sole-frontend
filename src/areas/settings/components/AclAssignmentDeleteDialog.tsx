import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";
import type { AclAssignmentDeleteDialogProps } from "@/areas/settings/types";
import { AclPermissionTags } from "@/entities/acl/components/AclPermissionTags";
import { getAssignmentUserLabel } from "@/entities/acl/utils";

export function AclAssignmentDeleteDialog({
	open,
	onOpenChange,
	assignment,
	onConfirm,
	isLoading,
}: AclAssignmentDeleteDialogProps) {
	const handleConfirm = () => {
		if (!assignment) return;
		onConfirm(assignment);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>Remove assignment</DialogTitle>
				</DialogHeader>
				<DialogBody className="space-y-4">
					<p className="text-sm text-muted-foreground">
						Remove direct permissions for{" "}
						<span className="font-semibold text-foreground">
							{assignment ? getAssignmentUserLabel(assignment) : "this user"}
						</span>
						?
					</p>
					{assignment ? (
						<div className="rounded-lg border border-border/70 bg-muted/20 px-3 py-2">
							<div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Permissions
							</div>
							<div className="mt-2">
								<AclPermissionTags
									permissions={assignment.permissions}
									maxVisible={6}
								/>
							</div>
						</div>
					) : null}
				</DialogBody>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button
						variant="destructive"
						onClick={handleConfirm}
						disabled={isLoading}
					>
						{isLoading ? "Removing..." : "Remove"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
