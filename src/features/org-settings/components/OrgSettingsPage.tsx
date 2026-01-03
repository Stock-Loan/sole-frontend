import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { queryKeys } from "@/lib/queryKeys";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { useToast } from "@/components/ui/use-toast";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { getOrgSettings, updateOrgSettings } from "../api/orgSettings.api";
import type { OrgSettingsFormValues } from "../types";

const optionalNumber = (
	min: number,
	max: number,
	minMessage: string,
	maxMessage: string
) =>
	z.preprocess(
		(value) => {
			if (value === "" || value === null || value === undefined) return null;
			if (typeof value === "number" && Number.isNaN(value)) return null;
			return value;
		},
		z.union([
			z.number().min(min, minMessage).max(max, maxMessage),
			z.null(),
		])
	);

const schema = z
	.object({
		allow_user_data_export: z.boolean(),
		allow_profile_edit: z.boolean(),
		require_two_factor: z.boolean(),
		audit_log_retention_days: z
			.number()
			.min(30, "Minimum 30 days")
			.max(3650, "Maximum 3650 days"),
		inactive_user_retention_days: z
			.number()
			.min(30, "Minimum 30 days")
			.max(3650, "Maximum 3650 days"),
		enforce_service_duration_rule: z.boolean(),
		min_service_duration_days: optionalNumber(
			0,
			36500,
			"Minimum 0 days",
			"Maximum 36500 days"
		),
		enforce_min_vested_to_exercise: z.boolean(),
		min_vested_shares_to_exercise: optionalNumber(
			0,
			1_000_000_000,
			"Minimum 0 shares",
			"Maximum 1,000,000,000 shares"
		),
	})
	.superRefine((values, ctx) => {
		if (
			values.enforce_service_duration_rule &&
			values.min_service_duration_days === null
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["min_service_duration_days"],
				message: "Service duration is required when the rule is enabled.",
			});
		}
		if (
			values.enforce_min_vested_to_exercise &&
			values.min_vested_shares_to_exercise === null
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["min_vested_shares_to_exercise"],
				message: "Minimum vested shares is required when the rule is enabled.",
			});
		}
	});

export function OrgSettingsPage() {
	const { can } = usePermissions();
	const canManage = can("org.settings.manage");
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const queryClient = useQueryClient();

	const settingsQuery = useQuery({
		queryKey: queryKeys.orgSettings.get(),
		queryFn: () => getOrgSettings(),
	});

	const form = useForm<OrgSettingsFormValues>({
		resolver: zodResolver(schema),
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

	const updateMutation = useMutation({
		mutationFn: updateOrgSettings,
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
			queryClient.invalidateQueries({ queryKey: queryKeys.orgSettings.get() });
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

	const enforceServiceDuration = form.watch("enforce_service_duration_rule");
	const enforceMinVested = form.watch("enforce_min_vested_to_exercise");

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
