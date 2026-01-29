import { useMemo } from "react";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { AclPermissionTags } from "@/entities/acl/components/AclPermissionTags";
import { getAssignmentUserLabel, isAclExpired } from "@/entities/acl/utils";
import type { AclUserPermissionsDialogProps } from "@/areas/settings/types";

export function AclUserPermissionsDialog({
	open,
	onOpenChange,
	assignment,
	assignments,
}: AclUserPermissionsDialogProps) {
	const userId = assignment?.user_id ?? null;
	const email = assignment?.email ?? null;
	const userLabel = assignment ? getAssignmentUserLabel(assignment) : "User";

	const activeAssignments = useMemo(() => {
		if (!userId) return [];
		return assignments.filter(
			(item) => item.user_id === userId && !isAclExpired(item.expires_at),
		);
	}, [assignments, userId]);

	const allowPermissions = useMemo(() => {
		const set = new Set<string>();
		activeAssignments
			.filter((item) => item.effect === "allow")
			.forEach((item) => item.permissions.forEach((permission) => set.add(permission)));
		return Array.from(set).sort();
	}, [activeAssignments]);

	const denyPermissions = useMemo(() => {
		const set = new Set<string>();
		activeAssignments
			.filter((item) => item.effect === "deny")
			.forEach((item) => item.permissions.forEach((permission) => set.add(permission)));
		return Array.from(set).sort();
	}, [activeAssignments]);

	const hasPermissions = allowPermissions.length > 0 || denyPermissions.length > 0;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle>Active permissions</DialogTitle>
				</DialogHeader>
				<DialogBody className="space-y-4">
					<div className="rounded-lg border border-border/60 bg-muted/30 px-4 py-3 text-sm">
						<div className="font-semibold text-foreground">{userLabel}</div>
						{email ? (
							<div className="text-xs text-muted-foreground">{email}</div>
						) : null}
					</div>
					{hasPermissions ? (
						<div className="space-y-4">
							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Allow
								</p>
								<AclPermissionTags
									permissions={allowPermissions}
									maxVisible={allowPermissions.length || 1}
								/>
							</div>
							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Deny
								</p>
								<AclPermissionTags
									permissions={denyPermissions}
									maxVisible={denyPermissions.length || 1}
								/>
							</div>
						</div>
					) : (
						<p className="text-sm text-muted-foreground">
							No active direct permissions for this user.
						</p>
					)}
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
