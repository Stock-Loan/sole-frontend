import { Archive, ShieldCheck } from "lucide-react";
import { useWatch } from "react-hook-form";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { Checkbox } from "@/shared/ui/checkbox";
import type { OrgSettingsGeneralRetentionTabProps } from "../types";
import { mfaEnforcementOptions } from "../constants";
import { toggleValue } from "../hooks";

export function OrgSettingsGeneralRetentionTab({
	form,
	canManage,
	isSubmitting,
}: OrgSettingsGeneralRetentionTabProps) {
	const requireTwoFactor = useWatch({
		control: form.control,
		name: "require_two_factor",
	});
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
							name="require_two_factor"
							render={({ field }) => (
								<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
									<div className="space-y-0.5">
										<FormLabel className="text-base">Require MFA</FormLabel>
										<div className="text-sm text-muted-foreground">
											Enable Multi-factor authentication to be required for all
											users
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
						<div className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="remember_device_days"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Remember device (days)</FormLabel>
										<div className="mb-2 text-sm text-muted-foreground">
											Days to skip MFA on trusted devices. 0 to disable.
										</div>
										<FormControl>
											<Input
												type="number"
												min={0}
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
										{requireTwoFactor ? (
											<span className="block mt-1 text-xs text-amber-600 font-medium">
												Note: "Require MFA during every login" overrides this
												setting.
											</span>
										) : null}
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="session_timeout_minutes"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Session timeout (minutes)</FormLabel>
										<div className="mb-2 text-sm text-muted-foreground">
											Auto logout after inactivity. Warning shows 60s before.
										</div>
										<FormControl>
											<Input
												type="number"
												min={1}
												max={60}
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
						<FormField
							control={form.control}
							name="mfa_required_actions"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Require MFA for</FormLabel>
									<div className="mb-2 text-sm text-muted-foreground">
										Choose when MFA is compulsory for users in this
										organization.
									</div>
									{!requireTwoFactor ? (
										<p className="text-xs text-muted-foreground">
											Enable “Require MFA” to configure these enforcement rules.
										</p>
									) : null}
									<div className="mt-3 grid gap-3 md:grid-cols-2">
										{mfaEnforcementOptions.map((option) => {
											const checked = field.value?.includes(option.value);
											return (
												<label
													key={option.value}
													className="flex items-start gap-3 rounded-lg border border-border/70 p-4 text-sm shadow-sm"
												>
													<Checkbox
														checked={checked}
														onCheckedChange={(value) => {
															const updated = toggleValue(
																field.value ?? [],
																option.value,
																Boolean(value),
															);
															form.setValue("mfa_required_actions", updated, {
																shouldDirty: true,
																shouldValidate: true,
															});
														}}
														disabled={
															!canManage || isSubmitting || !requireTwoFactor
														}
													/>
													<div>
														<p className="font-medium text-foreground">
															{option.label}
														</p>
														<p className="text-xs text-muted-foreground">
															{option.description}
														</p>
													</div>
												</label>
											);
										})}
									</div>
									<FormMessage />
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
