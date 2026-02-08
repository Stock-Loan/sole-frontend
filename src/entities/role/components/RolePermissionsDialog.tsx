import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { ROLE_TYPE_LABELS, ROLE_TYPE_STYLES } from "../constants";
import { normalizeDisplay } from "@/shared/lib/utils";
import type { RolePermissionsDialogProps } from "../types";

export function RolePermissionsDialog({
	role,
	open,
	onOpenChange,
}: RolePermissionsDialogProps) {
	const typeKey = role?.is_system_role ? "system" : "custom";

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<span>{normalizeDisplay(role?.name ?? "Role")}</span>
						<span
							className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${ROLE_TYPE_STYLES[typeKey]}`}
						>
							{ROLE_TYPE_LABELS[typeKey]}
						</span>
					</DialogTitle>
					<DialogDescription>
						{role?.description || "Permissions granted to this role."}
					</DialogDescription>
				</DialogHeader>
				<DialogBody className="space-y-4">
					<div className="space-y-1">
						<p className="text-sm font-semibold text-foreground">
							Permissions ({role?.permissions?.length ?? 0})
						</p>
						<p className="text-xs text-muted-foreground">
							Permissions apply within the current organization context.
						</p>
					</div>
					<div className="rounded-lg border bg-muted/40">
						<div className="max-h-80 overflow-auto px-4 py-3">
							{role?.permissions?.length ? (
								<ul className="space-y-2 text-sm">
									{role.permissions.map((perm) => (
										<li
											key={perm}
											className="flex items-center justify-between rounded-md border border-transparent bg-background px-3 py-2 shadow-sm"
										>
											<span className="font-medium text-foreground">{perm}</span>
										</li>
									))}
								</ul>
							) : (
								<p className="text-sm text-muted-foreground">
									No permissions assigned.
								</p>
							)}
						</div>
					</div>
				</DialogBody>
			</DialogContent>
		</Dialog>
	);
}
