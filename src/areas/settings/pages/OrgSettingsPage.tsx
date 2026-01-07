import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/ui/Form/form";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import { usePermissions } from "@/auth/hooks";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { useToast } from "@/shared/ui/use-toast";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { useOrgSettings, useUpdateOrgSettings } from "@/entities/org/hooks";
import type { OrgSettingsFormValues } from "@/entities/org/types";
import { orgSettingsSchema } from "../schemas";

export function OrgSettingsPage() {
	const { can } = usePermissions();
	const canManage = can("org.settings.manage");
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();

	const settingsQuery = useOrgSettings();

	const form = useForm<OrgSettingsFormValues>({
		resolver: zodResolver(orgSettingsSchema),
		defaultValues: {
			allow_user_data_export: true,
			allow_profile_edit: true,
			require_two_factor: false,
			audit_log_retention_days: 180,
			inactive_user_retention_days: 180,
			enforce_service_duration_rule: false,
			min_service_duration_days: null,
			enforce_min_vested_to_exercise: false,
			min_vested_shares_to_exercise: null,
		},
	});

	useEffect(() => {
		if (settingsQuery.data) {
			const data = settingsQuery.data;
			form.reset({
				allow_user_data_export: Boolean(data.allow_user_data_export),
				allow_profile_edit: Boolean(data.allow_profile_edit),
				require_two_factor: Boolean(data.require_two_factor),
				audit_log_retention_days: data.audit_log_retention_days ?? 180,
				inactive_user_retention_days: data.inactive_user_retention_days ?? 180,
				enforce_service_duration_rule: Boolean(
					data.enforce_service_duration_rule
				),
				min_service_duration_days:
					data.min_service_duration_days ?? null,
				enforce_min_vested_to_exercise: Boolean(
					data.enforce_min_vested_to_exercise
				),
				min_vested_shares_to_exercise:
					data.min_vested_shares_to_exercise ?? null,
			});
		}
	}, [settingsQuery.data, form]);

	const updateMutation = useUpdateOrgSettings({
		onSuccess: (updated) => {
			toast({ title: "Settings saved" });
			form.reset({
				allow_user_data_export: updated.allow_user_data_export,
				allow_profile_edit: updated.allow_profile_edit,
				require_two_factor: updated.require_two_factor,
				audit_log_retention_days: updated.audit_log_retention_days,
				inactive_user_retention_days: updated.inactive_user_retention_days,
				enforce_service_duration_rule: Boolean(
					updated.enforce_service_duration_rule
				),
				min_service_duration_days:
					updated.min_service_duration_days ?? null,
				enforce_min_vested_to_exercise: Boolean(
					updated.enforce_min_vested_to_exercise
				),
				min_vested_shares_to_exercise:
					updated.min_vested_shares_to_exercise ?? null,
			});
		},
		onError: (error) => apiErrorToast(error, "Unable to save settings."),
	});

	const onSubmit = (values: OrgSettingsFormValues) => {
		if (!canManage) return;
		updateMutation.mutate({
			...values,
			min_service_duration_days: values.enforce_service_duration_rule
				? values.min_service_duration_days
				: null,
			min_vested_shares_to_exercise: values.enforce_min_vested_to_exercise
				? values.min_vested_shares_to_exercise
				: null,
		});
	};

	const enforceServiceDuration = useWatch({
		control: form.control,
		name: "enforce_service_duration_rule",
	});
	const enforceMinVested = useWatch({
		control: form.control,
		name: "enforce_min_vested_to_exercise",
	});

	if (settingsQuery.isLoading) {
		return (
			<PageContainer>
				<LoadingState label="Loading organization settings..." />
			</PageContainer>
		);
	}

	if (settingsQuery.isError) {
		return (
			<PageContainer>
				<EmptyState
					title="Unable to load settings"
					message="Please try again or contact an administrator."
					actionLabel="Retry"
					onRetry={() => settingsQuery.refetch()}
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer>
			<PageHeader
				title="Organization settings"
				subtitle="Control profile editing, data export, and retention rules for this organization."
				actions={
					<Button
						variant="outline"
						size="sm"
						onClick={() => settingsQuery.refetch()}
						disabled={settingsQuery.isFetching}
					>
						Refresh
					</Button>
				}
			/>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>Access controls</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<FormField
								control={form.control}
								name="allow_profile_edit"
								render={({ field }) => (
									<FormItem className="flex items-start justify-between space-y-0 border border-border/60 bg-muted/20 p-3 rounded-md">
										<div className="space-y-1">
											<FormLabel>Allow profile editing</FormLabel>
											<p className="text-sm text-muted-foreground">
												When disabled, profile updates are blocked.
											</p>
										</div>
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={!canManage || updateMutation.isPending}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="allow_user_data_export"
								render={({ field }) => (
									<FormItem className="flex items-start justify-between space-y-0 border border-border/60 bg-muted/20 p-3 rounded-md">
										<div className="space-y-1">
											<FormLabel>Allow user data export</FormLabel>
											<p className="text-sm text-muted-foreground">
												Enable or disable user data export for this org.
											</p>
										</div>
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={!canManage || updateMutation.isPending}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="require_two_factor"
								render={({ field }) => (
									<FormItem className="flex items-start justify-between space-y-0 border border-border/60 bg-muted/20 p-3 rounded-md">
										<div className="space-y-1">
											<FormLabel>Require 2FA (reserved)</FormLabel>
											<p className="text-sm text-muted-foreground">
												Flag reserved for future MFA enforcement.
											</p>
										</div>
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
												disabled={!canManage || updateMutation.isPending}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Retention</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-4 md:grid-cols-2">
							<FormField
								control={form.control}
								name="audit_log_retention_days"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Audit log retention (days)</FormLabel>
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
												disabled={!canManage || updateMutation.isPending}
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
												disabled={!canManage || updateMutation.isPending}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Stock program rules</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<FormField
								control={form.control}
								name="enforce_service_duration_rule"
								render={({ field }) => (
									<FormItem className="flex items-start justify-between space-y-0 rounded-md border border-border/60 bg-muted/20 p-3">
										<div className="space-y-1">
											<FormLabel>Require minimum service duration</FormLabel>
											<p className="text-sm text-muted-foreground">
												Block exercises until an employee meets the minimum
												service duration.
											</p>
										</div>
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) => {
													const nextValue = Boolean(checked);
													field.onChange(nextValue);
													if (!nextValue) {
														form.setValue("min_service_duration_days", null, {
															shouldDirty: true,
														});
													}
												}}
												disabled={!canManage || updateMutation.isPending}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="min_service_duration_days"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Minimum service duration (days)</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												max={36500}
												{...field}
												value={field.value ?? ""}
												onChange={(event) => {
													const nextValue =
														event.target.value === ""
															? null
															: event.target.valueAsNumber;
													field.onChange(
														Number.isNaN(nextValue) ? null : nextValue
													);
												}}
												disabled={
													!canManage ||
													updateMutation.isPending ||
													!enforceServiceDuration
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name="enforce_min_vested_to_exercise"
								render={({ field }) => (
									<FormItem className="flex items-start justify-between space-y-0 rounded-md border border-border/60 bg-muted/20 p-3">
										<div className="space-y-1">
											<FormLabel>Require minimum vested shares</FormLabel>
											<p className="text-sm text-muted-foreground">
												Require a minimum cumulative vested share count before
												exercising.
											</p>
										</div>
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={(checked) => {
													const nextValue = Boolean(checked);
													field.onChange(nextValue);
													if (!nextValue) {
														form.setValue(
															"min_vested_shares_to_exercise",
															null,
															{ shouldDirty: true }
														);
													}
												}}
												disabled={!canManage || updateMutation.isPending}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="min_vested_shares_to_exercise"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Minimum vested shares to exercise</FormLabel>
										<FormControl>
											<Input
												type="number"
												min={0}
												max={1_000_000_000}
												{...field}
												value={field.value ?? ""}
												onChange={(event) => {
													const nextValue =
														event.target.value === ""
															? null
															: event.target.valueAsNumber;
													field.onChange(
														Number.isNaN(nextValue) ? null : nextValue
													);
												}}
												disabled={
													!canManage ||
													updateMutation.isPending ||
													!enforceMinVested
												}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button
							type="submit"
							disabled={!canManage || updateMutation.isPending}
						>
							{updateMutation.isPending ? "Saving..." : "Save settings"}
						</Button>
					</div>
				</form>
			</Form>
		</PageContainer>
	);
}
