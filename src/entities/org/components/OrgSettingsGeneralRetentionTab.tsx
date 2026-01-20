import { Archive, ShieldCheck } from "lucide-react";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import type { OrgSettingsGeneralRetentionTabProps } from "../types";

export function OrgSettingsGeneralRetentionTab({
	form,
	canManage,
	isSubmitting,
}: OrgSettingsGeneralRetentionTabProps) {
	return (
		<div className="grid min-h-0 flex-1 gap-6 lg:grid-cols-2">
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="border-b border-border/70 px-6 py-3">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
							<ShieldCheck className="h-4 w-4" />
						</div>
						<div>
							<h3 className="text-base font-semibold">Access controls</h3>
							<p className="text-xs text-muted-foreground">
								Manage user permissions and security policies.
							</p>
						</div>
					</div>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
					<div className="space-y-6">
						<FormField
							control={form.control}
							name="allow_profile_edit"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Allow profile editing
										</FormLabel>
										<div className="text-sm text-muted-foreground">
											When disabled, users cannot change their profile details.
										</div>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
											disabled={!canManage || isSubmitting}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="allow_user_data_export"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Allow user data export
										</FormLabel>
										<div className="text-sm text-muted-foreground">
											Enable or disable personal data export for employees.
										</div>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
											disabled={!canManage || isSubmitting}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="require_two_factor"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
									<div className="space-y-0.5">
										<FormLabel className="text-base">
											Require 2FA (reserved)
										</FormLabel>
										<div className="text-sm text-muted-foreground">
											Future enforcement policy for multi-factor authentication.
										</div>
									</div>
									<FormControl>
										<Switch
											checked={field.value}
											onCheckedChange={field.onChange}
											disabled={!canManage || isSubmitting}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</div>
				</div>
			</div>
			<div className="flex min-h-0 flex-1 flex-col">
				<div className="border-b border-border/70 px-6 py-3">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
							<Archive className="h-4 w-4" />
						</div>
						<div>
							<h3 className="text-base font-semibold">Data retention</h3>
							<p className="text-xs text-muted-foreground">
								Configure how long sensitive data is kept.
							</p>
						</div>
					</div>
				</div>
				<div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
					<div className="grid max-w-2xl gap-6">
						<FormField
							control={form.control}
							name="audit_log_retention_days"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Audit log retention (days)</FormLabel>
									<div className="mb-2 text-sm text-muted-foreground">
										How long to keep audit trail records before deletion.
									</div>
									<FormControl>
										<Input
											type="number"
											min={30}
											max={3650}
											{...field}
											value={Number.isNaN(field.value) ? "" : field.value}
											onChange={(event) =>
												field.onChange(event.target.valueAsNumber)
											}
											disabled={!canManage || isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="inactive_user_retention_days"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Inactive user retention (days)</FormLabel>
									<div className="mb-2 text-sm text-muted-foreground">
										Period to retain data for deactivated users.
									</div>
									<FormControl>
										<Input
											type="number"
											min={30}
											max={3650}
											{...field}
											value={Number.isNaN(field.value) ? "" : field.value}
											onChange={(event) =>
												field.onChange(event.target.valueAsNumber)
											}
											disabled={!canManage || isSubmitting}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
