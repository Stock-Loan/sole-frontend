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

const schema = z.object({
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
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.orgSettings.get() });
		},
		onError: (error) => apiErrorToast(error, "Unable to save settings."),
	});

	const onSubmit = (values: OrgSettingsFormValues) => {
		if (!canManage) return;
		updateMutation.mutate(values);
	};

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
