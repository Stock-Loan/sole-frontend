import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Archive, Coins, FileText, ShieldCheck } from "lucide-react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
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
import { Switch } from "@/shared/ui/switch";
import { TabButton } from "@/shared/ui/TabButton";
import { Checkbox } from "@/shared/ui/checkbox";
import { usePermissions } from "@/auth/hooks";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { useToast } from "@/shared/ui/use-toast";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { useOrgSettings, useUpdateOrgSettings } from "@/entities/org/hooks";
import type { OrgSettingsFormValues } from "@/entities/org/types";
import { orgSettingsSchema } from "../schemas";

type OrgSettingsTabKey = "general" | "retention" | "stock" | "loans";

const repaymentMethodOptions = [
	{
		value: "INTEREST_ONLY",
		label: "Interest only",
		description: "Pay interest during the term, principal due at the end.",
	},
	{
		value: "BALLOON",
		label: "Balloon",
		description: "Smaller periodic payments with a larger final payment.",
	},
	{
		value: "PRINCIPAL_AND_INTEREST",
		label: "Principal and interest",
		description: "Standard amortized payments over the term.",
	},
] as const;

const interestTypeOptions = [
	{
		value: "FIXED",
		label: "Fixed",
		description: "Fixed annual interest rate for the full term.",
	},
	{
		value: "VARIABLE",
		label: "Variable",
		description: "Base rate plus margin, adjustable over time.",
	},
] as const;

function parseNumber(value: number | string | null | undefined) {
	if (value === null || value === undefined || value === "") return null;
	const numeric = typeof value === "number" ? value : Number(value);
	return Number.isFinite(numeric) ? numeric : null;
}

function toggleValue<T extends string>(current: T[], value: T, checked: boolean) {
	if (checked) {
		return current.includes(value) ? current : [...current, value];
	}
	return current.filter((item) => item !== value);
}

export function OrgSettingsPage() {
	const { can } = usePermissions();
	const canManage = can("org.settings.manage");
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const [tab, setTab] = useState<OrgSettingsTabKey>("general");

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
			allowed_repayment_methods: [],
			allowed_interest_types: [],
			min_loan_term_months: 6,
			max_loan_term_months: 60,
			fixed_interest_rate_annual_percent: null,
			variable_base_rate_annual_percent: null,
			variable_margin_annual_percent: null,
			require_down_payment: false,
			down_payment_percent: null,
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
				allowed_repayment_methods: data.allowed_repayment_methods ?? [],
				allowed_interest_types: data.allowed_interest_types ?? [],
				min_loan_term_months: data.min_loan_term_months ?? 6,
				max_loan_term_months: data.max_loan_term_months ?? 60,
				fixed_interest_rate_annual_percent: parseNumber(
					data.fixed_interest_rate_annual_percent
				),
				variable_base_rate_annual_percent: parseNumber(
					data.variable_base_rate_annual_percent
				),
				variable_margin_annual_percent: parseNumber(
					data.variable_margin_annual_percent
				),
				require_down_payment: Boolean(data.require_down_payment),
				down_payment_percent: parseNumber(data.down_payment_percent),
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
				allowed_repayment_methods: updated.allowed_repayment_methods ?? [],
				allowed_interest_types: updated.allowed_interest_types ?? [],
				min_loan_term_months: updated.min_loan_term_months ?? 6,
				max_loan_term_months: updated.max_loan_term_months ?? 60,
				fixed_interest_rate_annual_percent: parseNumber(
					updated.fixed_interest_rate_annual_percent
				),
				variable_base_rate_annual_percent: parseNumber(
					updated.variable_base_rate_annual_percent
				),
				variable_margin_annual_percent: parseNumber(
					updated.variable_margin_annual_percent
				),
				require_down_payment: Boolean(updated.require_down_payment),
				down_payment_percent: parseNumber(updated.down_payment_percent),
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
			down_payment_percent: values.require_down_payment
				? values.down_payment_percent
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
	const selectedInterestTypes = useWatch({
		control: form.control,
		name: "allowed_interest_types",
	});
	const requireDownPayment = useWatch({
		control: form.control,
		name: "require_down_payment",
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
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
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

			<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
				<TabButton
					label="General"
					value="general"
					active={tab === "general"}
					onSelect={(v) => setTab(v as OrgSettingsTabKey)}
				/>
				<TabButton
					label="Retention"
					value="retention"
					active={tab === "retention"}
					onSelect={(v) => setTab(v as OrgSettingsTabKey)}
				/>
				<TabButton
					label="Stock"
					value="stock"
					active={tab === "stock"}
					onSelect={(v) => setTab(v as OrgSettingsTabKey)}
				/>
				<TabButton
					label="Loans"
					value="loans"
					active={tab === "loans"}
					onSelect={(v) => setTab(v as OrgSettingsTabKey)}
				/>
			</div>

			<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex min-h-0 flex-1 flex-col"
					>
						{tab === "general" && (
							<div className="flex min-h-0 flex-1 flex-col">
								<div className="border-b border-border/70 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
											<ShieldCheck className="h-6 w-6" />
										</div>
										<div>
											<h2 className="text-lg font-semibold">Access controls</h2>
											<p className="text-sm text-muted-foreground">
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
															When disabled, users cannot change their profile
															details.
														</div>
													</div>
													<FormControl>
														<Switch
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
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
													<div className="space-y-0.5">
														<FormLabel className="text-base">
															Allow user data export
														</FormLabel>
														<div className="text-sm text-muted-foreground">
															Enable or disable personal data export for
															employees.
														</div>
													</div>
													<FormControl>
														<Switch
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
												<FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm">
													<div className="space-y-0.5">
														<FormLabel className="text-base">
															Require 2FA (reserved)
														</FormLabel>
														<div className="text-sm text-muted-foreground">
															Future enforcement policy for multi-factor
															authentication.
														</div>
													</div>
													<FormControl>
														<Switch
															checked={field.value}
															onCheckedChange={field.onChange}
															disabled={!canManage || updateMutation.isPending}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</div>
								</div>
							</div>
						)}

						{tab === "retention" && (
							<div className="flex min-h-0 flex-1 flex-col">
								<div className="border-b border-border/70 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
											<Archive className="h-6 w-6" />
										</div>
										<div>
											<h2 className="text-lg font-semibold">Data retention</h2>
											<p className="text-sm text-muted-foreground">
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
														How long to keep audit trail records before
														deletion.
													</div>
													<FormControl>
														<Input
															type="number"
															min={30}
															max={3650}
															{...field}
															value={
																Number.isNaN(field.value) ? "" : field.value
															}
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
													<div className="mb-2 text-sm text-muted-foreground">
														Period to retain data for deactivated users.
													</div>
													<FormControl>
														<Input
															type="number"
															min={30}
															max={3650}
															{...field}
															value={
																Number.isNaN(field.value) ? "" : field.value
															}
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
									</div>
								</div>
							</div>
						)}

						{tab === "stock" && (
							<div className="flex min-h-0 flex-1 flex-col">
								<div className="border-b border-border/70 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
											<Coins className="h-6 w-6" />
										</div>
										<div>
											<h2 className="text-lg font-semibold">Stock program</h2>
											<p className="text-sm text-muted-foreground">
												Define rules for exercise eligibility and vesting.
											</p>
										</div>
									</div>
								</div>
								<div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
									<div className="space-y-6">
										<div className="space-y-4 rounded-lg border p-4 shadow-sm">
											<FormField
												control={form.control}
												name="enforce_service_duration_rule"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between">
														<div className="space-y-0.5">
															<FormLabel className="text-base">
																Require minimum service duration
															</FormLabel>
															<div className="text-sm text-muted-foreground">
																Block exercises until an employee meets the
																minimum service duration.
															</div>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={(checked) => {
																	const nextValue = Boolean(checked);
																	field.onChange(nextValue);
																	if (!nextValue) {
																		form.setValue(
																			"min_service_duration_days",
																			null,
																			{
																				shouldDirty: true,
																			}
																		);
																	}
																}}
																disabled={
																	!canManage || updateMutation.isPending
																}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
											{enforceServiceDuration && (
												<div className="pl-1 pt-2">
													<FormField
														control={form.control}
														name="min_service_duration_days"
														render={({ field }) => (
															<FormItem className="max-w-xs">
																<FormLabel>
																	Minimum service duration (days)
																</FormLabel>
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
																				Number.isNaN(nextValue)
																					? null
																					: nextValue
																			);
																		}}
																		disabled={
																			!canManage ||
																			updateMutation.isPending
																		}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											)}
										</div>

										<div className="space-y-4 rounded-lg border p-4 shadow-sm">
											<FormField
												control={form.control}
												name="enforce_min_vested_to_exercise"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between">
														<div className="space-y-0.5">
															<FormLabel className="text-base">
																Require minimum vested shares
															</FormLabel>
															<div className="text-sm text-muted-foreground">
																Require a minimum cumulative vested share count
																before exercising.
															</div>
														</div>
														<FormControl>
															<Switch
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
																disabled={
																	!canManage || updateMutation.isPending
																}
															/>
														</FormControl>
													</FormItem>
												)}
											/>
											{enforceMinVested && (
												<div className="pl-1 pt-2">
													<FormField
														control={form.control}
														name="min_vested_shares_to_exercise"
														render={({ field }) => (
															<FormItem className="max-w-xs">
																<FormLabel>
																	Minimum vested shares to exercise
																</FormLabel>
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
																				Number.isNaN(nextValue)
																					? null
																					: nextValue
																			);
																		}}
																		disabled={
																			!canManage ||
																			updateMutation.isPending
																		}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{tab === "loans" && (
							<div className="flex min-h-0 flex-1 flex-col">
								<div className="border-b border-border/70 px-6 py-4">
									<div className="flex items-center gap-3">
										<div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
											<FileText className="h-6 w-6" />
										</div>
										<div>
											<h2 className="text-lg font-semibold">Loan settings</h2>
											<p className="text-sm text-muted-foreground">
												Define repayment, interest, and policy defaults for employee loans.
											</p>
										</div>
									</div>
								</div>
								<div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
									<div className="space-y-6">
										<FormField
											control={form.control}
											name="allowed_repayment_methods"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Repayment methods</FormLabel>
													<div className="mt-2 grid gap-3 md:grid-cols-2">
														{repaymentMethodOptions.map((option) => {
															const checked = field.value?.includes(option.value);
															return (
																<label
																	key={option.value}
																	className="flex items-start gap-3 rounded-lg border border-border/70 p-4 text-sm shadow-sm"
																>
																	<Checkbox
																		checked={checked}
																		onCheckedChange={(value) =>
																			field.onChange(
																				toggleValue(
																					field.value ?? [],
																					option.value,
																					Boolean(value)
																				)
																			)
																		}
																		disabled={!canManage || updateMutation.isPending}
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

										<FormField
											control={form.control}
											name="allowed_interest_types"
											render={({ field }) => (
												<FormItem>
													<FormLabel>Interest types</FormLabel>
													<div className="mt-2 grid gap-3 md:grid-cols-2">
														{interestTypeOptions.map((option) => {
															const checked = field.value?.includes(option.value);
															return (
																<label
																	key={option.value}
																	className="flex items-start gap-3 rounded-lg border border-border/70 p-4 text-sm shadow-sm"
																>
																	<Checkbox
																		checked={checked}
																		onCheckedChange={(value) =>
																			field.onChange(
																				toggleValue(
																					field.value ?? [],
																					option.value,
																					Boolean(value)
																				)
																			)
																		}
																		disabled={!canManage || updateMutation.isPending}
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

										<div className="grid gap-6 md:grid-cols-2">
											<FormField
												control={form.control}
												name="min_loan_term_months"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Minimum term (months)</FormLabel>
														<FormControl>
															<Input
																type="number"
																min={1}
																max={360}
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
												name="max_loan_term_months"
												render={({ field }) => (
													<FormItem>
														<FormLabel>Maximum term (months)</FormLabel>
														<FormControl>
															<Input
																type="number"
																min={1}
																max={360}
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
										</div>

										<div className="space-y-4 rounded-lg border border-border/70 p-4 shadow-sm">
											<p className="text-sm font-semibold text-foreground">Rates</p>
											{selectedInterestTypes?.includes("FIXED") ? (
												<FormField
													control={form.control}
													name="fixed_interest_rate_annual_percent"
													render={({ field }) => (
														<FormItem>
															<FormLabel>Fixed annual rate (%)</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	step="0.01"
																	min={0}
																	{...field}
																	value={field.value ?? ""}
																	onChange={(event) =>
																		field.onChange(
																			Number.isNaN(event.target.valueAsNumber)
																				? null
																				: event.target.valueAsNumber
																		)
																	}
																	disabled={!canManage || updateMutation.isPending}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											) : null}
											{selectedInterestTypes?.includes("VARIABLE") ? (
												<div className="grid gap-4 md:grid-cols-2">
													<FormField
														control={form.control}
														name="variable_base_rate_annual_percent"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Variable base rate (%)</FormLabel>
																<FormControl>
																	<Input
																		type="number"
																		step="0.01"
																		min={0}
																		{...field}
																		value={field.value ?? ""}
																		onChange={(event) =>
																			field.onChange(
																				Number.isNaN(event.target.valueAsNumber)
																					? null
																					: event.target.valueAsNumber
																			)
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
														name="variable_margin_annual_percent"
														render={({ field }) => (
															<FormItem>
																<FormLabel>Variable margin (%)</FormLabel>
																<FormControl>
																	<Input
																		type="number"
																		step="0.01"
																		min={0}
																		{...field}
																		value={field.value ?? ""}
																		onChange={(event) =>
																			field.onChange(
																				Number.isNaN(event.target.valueAsNumber)
																					? null
																					: event.target.valueAsNumber
																			)
																		}
																		disabled={!canManage || updateMutation.isPending}
																	/>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												</div>
											) : null}
										</div>

										<div className="space-y-4 rounded-lg border border-border/70 p-4 shadow-sm">
											<FormField
												control={form.control}
												name="require_down_payment"
												render={({ field }) => (
													<FormItem className="flex flex-row items-center justify-between">
														<div className="space-y-0.5">
															<FormLabel className="text-base">
																Require down payment
															</FormLabel>
															<div className="text-sm text-muted-foreground">
																Require employees to provide a down payment before
																loan funding.
															</div>
														</div>
														<FormControl>
															<Switch
																checked={field.value}
																onCheckedChange={(checked) => {
																	const nextValue = Boolean(checked);
																	field.onChange(nextValue);
																	if (!nextValue) {
																		form.setValue("down_payment_percent", null, {
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
											{requireDownPayment ? (
												<FormField
													control={form.control}
													name="down_payment_percent"
													render={({ field }) => (
														<FormItem className="max-w-xs">
															<FormLabel>Down payment percent (%)</FormLabel>
															<FormControl>
																<Input
																	type="number"
																	step="0.01"
																	min={0}
																	{...field}
																	value={field.value ?? ""}
																	onChange={(event) =>
																		field.onChange(
																			Number.isNaN(event.target.valueAsNumber)
																				? null
																				: event.target.valueAsNumber
																		)
																	}
																	disabled={!canManage || updateMutation.isPending}
																/>
															</FormControl>
															<FormMessage />
														</FormItem>
													)}
												/>
											) : null}
										</div>
									</div>
								</div>
							</div>
						)}

						<div className="flex justify-end border-t border-border/70 p-4">
							<Button
								type="submit"
								disabled={!canManage || updateMutation.isPending}
							>
								{updateMutation.isPending ? "Saving..." : "Save settings"}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</PageContainer>
	);
}
