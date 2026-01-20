import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type FieldErrors } from "react-hook-form";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { Form } from "@/shared/ui/Form/form";
import { TabButton } from "@/shared/ui/TabButton";
import { usePermissions } from "@/auth/hooks";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { useToast } from "@/shared/ui/use-toast";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { useOrgSettings, useUpdateOrgSettings } from "@/entities/org/hooks";
import { OrgSettingsGeneralRetentionTab } from "@/entities/org/components/OrgSettingsGeneralRetentionTab";
import { OrgSettingsStockLoanTab } from "@/entities/org/components/OrgSettingsStockLoanTab";
import type {
	OrgSettingsFormValues,
	OrgSettingsTabKey,
} from "@/entities/org/types";
import { orgSettingsSchema } from "@/entities/org/schemas";
import { parseNumber } from "@/shared/lib/format";
import { SETTINGS_TAB_MAP } from "@/entities/org/constants";

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
			min_service_duration_years: null,
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
					data.enforce_service_duration_rule,
				),
				min_service_duration_years: parseNumber(
					data.min_service_duration_years,
				),
				enforce_min_vested_to_exercise: Boolean(
					data.enforce_min_vested_to_exercise,
				),
				min_vested_shares_to_exercise:
					data.min_vested_shares_to_exercise ?? null,
				allowed_repayment_methods: data.allowed_repayment_methods ?? [],
				allowed_interest_types: data.allowed_interest_types ?? [],
				min_loan_term_months: data.min_loan_term_months ?? 6,
				max_loan_term_months: data.max_loan_term_months ?? 60,
				fixed_interest_rate_annual_percent: parseNumber(
					data.fixed_interest_rate_annual_percent,
				),
				variable_base_rate_annual_percent: parseNumber(
					data.variable_base_rate_annual_percent,
				),
				variable_margin_annual_percent: parseNumber(
					data.variable_margin_annual_percent,
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
					updated.enforce_service_duration_rule,
				),
				min_service_duration_years: parseNumber(
					updated.min_service_duration_years,
				),
				enforce_min_vested_to_exercise: Boolean(
					updated.enforce_min_vested_to_exercise,
				),
				min_vested_shares_to_exercise:
					updated.min_vested_shares_to_exercise ?? null,
				allowed_repayment_methods: updated.allowed_repayment_methods ?? [],
				allowed_interest_types: updated.allowed_interest_types ?? [],
				min_loan_term_months: updated.min_loan_term_months ?? 6,
				max_loan_term_months: updated.max_loan_term_months ?? 60,
				fixed_interest_rate_annual_percent: parseNumber(
					updated.fixed_interest_rate_annual_percent,
				),
				variable_base_rate_annual_percent: parseNumber(
					updated.variable_base_rate_annual_percent,
				),
				variable_margin_annual_percent: parseNumber(
					updated.variable_margin_annual_percent,
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
			min_service_duration_years: values.enforce_service_duration_rule
				? values.min_service_duration_years
				: null,
			min_vested_shares_to_exercise: values.enforce_min_vested_to_exercise
				? values.min_vested_shares_to_exercise
				: null,
			down_payment_percent: values.require_down_payment
				? values.down_payment_percent
				: null,
		});
	};

	const onInvalid = (errors: FieldErrors<OrgSettingsFormValues>) => {
		const firstErrorKey = Object.keys(errors)[0] as
			| keyof OrgSettingsFormValues
			| undefined;
		if (firstErrorKey) {
			const nextTab = SETTINGS_TAB_MAP[firstErrorKey];
			if (nextTab && nextTab !== tab) {
				setTab(nextTab);
			}
		}
		toast({
			variant: "destructive",
			title: "Fix highlighted settings",
			description: "Review the required fields before saving.",
		});
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
					label="General & Retention"
					value="general"
					active={tab === "general"}
					onSelect={(v) => setTab(v as OrgSettingsTabKey)}
				/>
				<TabButton
					label="Stock & Loan"
					value="stock"
					active={tab === "stock"}
					onSelect={(v) => setTab(v as OrgSettingsTabKey)}
				/>
			</div>

			<div className="flex min-h-0 flex-1 flex-col">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit, onInvalid)}
						className="flex min-h-0 flex-1 flex-col"
					>
						{tab === "general" && (
							<OrgSettingsGeneralRetentionTab
								form={form}
								canManage={canManage}
								isSubmitting={updateMutation.isPending}
							/>
						)}

						{tab === "stock" && (
							<OrgSettingsStockLoanTab
								form={form}
								canManage={canManage}
								isSubmitting={updateMutation.isPending}
							/>
						)}

						<div className="mt-4 flex justify-end border-t border-border/70 px-4 py-2">
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
