import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import type { AuditLog } from "@/entities/audit/types";
import { useState } from "react";
import {
	formatAuditChanges,
	getAuditChangeEntries,
	stringifyAuditJson,
	stringifyAuditValue,
} from "@/entities/audit/utils";
import { formatDate } from "@/shared/lib/format";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";

interface AuditLogDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	auditLog: AuditLog | null;
}

export function AuditLogDialog({
	open,
	onOpenChange,
	auditLog,
}: AuditLogDialogProps) {
	const [showRaw, setShowRaw] = useState(false);

	if (!auditLog) {
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent size="md">
					<DialogHeader>
						<DialogTitle>Audit log</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<p className="text-sm text-muted-foreground">
							No audit log selected.
						</p>
					</DialogBody>
				</DialogContent>
			</Dialog>
		);
	}

	const changeEntries = getAuditChangeEntries(auditLog.changes);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="md">
				<DialogHeader>
					<DialogTitle>Audit log detail</DialogTitle>
				</DialogHeader>
				<DialogBody className="space-y-5">
					<div className="grid gap-3 text-sm">
						<div>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Action
							</p>
							<p className="text-foreground">{auditLog.action}</p>
							{auditLog.summary ? (
								<p className="text-xs text-muted-foreground">
									{auditLog.summary}
								</p>
							) : null}
						</div>
						<div className="grid gap-3 sm:grid-cols-2">
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Audit ID
								</p>
								<p className="text-foreground">{auditLog.id}</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Org ID
								</p>
								<p className="text-foreground">{auditLog.org_id ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Actor
								</p>
								<p className="text-foreground">
									{auditLog.actor?.full_name ?? "—"}
								</p>
								{auditLog.actor?.email ? (
									<p className="text-xs text-muted-foreground">
										{auditLog.actor.email}
									</p>
								) : null}
								<p className="text-xs text-muted-foreground">
									{auditLog.actor?.user_id ?? auditLog.actor_id ?? "—"}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Created
								</p>
								<p className="text-foreground">
									{formatDate(auditLog.created_at)}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Resource type
								</p>
								<p className="text-foreground">
									{auditLog.resource_type ?? "—"}
								</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Resource ID
								</p>
								<p className="text-foreground">{auditLog.resource_id ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Actor ID
								</p>
								<p className="text-foreground">{auditLog.actor_id ?? "—"}</p>
							</div>
							<div>
								<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									Action summary
								</p>
								<p className="text-foreground">{auditLog.summary ?? "—"}</p>
							</div>
						</div>
					</div>

					<div className="rounded-lg border border-border/60 bg-muted/20 p-3">
						<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
							Changes
						</p>
						{changeEntries.length ? (
							<div className="mt-2 space-y-2 text-xs text-foreground">
								{changeEntries.map((entry) => (
									<div key={entry.field} className="flex flex-wrap gap-2">
										<span className="font-semibold">{entry.field}:</span>
											<span className="text-muted-foreground">
												{entry.from} {"->"} {entry.to}
											</span>
									</div>
								))}
							</div>
						) : (
							<p className="mt-2 text-xs text-muted-foreground">
								{formatAuditChanges(auditLog.changes)}
							</p>
						)}
					</div>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="rounded-lg border border-border/60 bg-muted/20 p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Old value
							</p>
							<pre className="mt-2 max-h-48 overflow-auto rounded-md bg-background p-2 text-xs text-muted-foreground">
								{showRaw
									? stringifyAuditJson(auditLog.old_value) || "—"
									: stringifyAuditValue(auditLog.old_value) || "—"}
							</pre>
						</div>
						<div className="rounded-lg border border-border/60 bg-muted/20 p-3">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								New value
							</p>
							<pre className="mt-2 max-h-48 overflow-auto rounded-md bg-background p-2 text-xs text-muted-foreground">
								{showRaw
									? stringifyAuditJson(auditLog.new_value) || "—"
									: stringifyAuditValue(auditLog.new_value) || "—"}
							</pre>
						</div>
					</div>
				</DialogBody>
				<DialogFooter className="justify-between sm:justify-between">
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Label htmlFor="audit-raw-toggle">Show raw JSON</Label>
						<Switch
							id="audit-raw-toggle"
							checked={showRaw}
							onCheckedChange={setShowRaw}
						/>
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
