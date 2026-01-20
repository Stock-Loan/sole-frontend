import { useMemo } from "react";
import { RefreshCw } from "lucide-react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { usePermissions } from "@/auth/hooks";
import { useAuth } from "@/auth/hooks";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { loadDataTablePreferences } from "@/shared/ui/Table/constants";
import { usePbgcRates, useRefreshPbgcRates } from "@/entities/org/hooks";
import type { PbgcMidTermRate } from "@/entities/org/types";
import { formatRate } from "@/shared/lib/format";
import { MONTH_LABELS } from "@/entities/org/constants";

export function MidTermRatesPage() {
	const { can } = usePermissions();
	const canManage = can("org.settings.manage");
	const canView = can("org.settings.view");
	const { user } = useAuth();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();

	const preferencesConfig = useMemo(
		() => ({
			id: "pbgc-mid-term-rates",
			scope: "user" as const,
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
			version: 1,
		}),
		[user?.id, user?.org_id],
	);

	const persistedPreferences = useMemo(
		() => loadDataTablePreferences(preferencesConfig),
		[preferencesConfig],
	);

	const ratesQuery = usePbgcRates();
	const refreshMutation = useRefreshPbgcRates({
		onSuccess: (response) => {
			toast({
				title: "Rates refreshed",
				description: `Updated ${response.updated_rows} rows.`,
			});
		},
		onError: (error) => apiErrorToast(error, "Unable to refresh rates."),
	});

	const columns = useMemo<ColumnDefinition<PbgcMidTermRate>[]>(
		() => [
			{
				id: "year",
				header: "Year",
				accessor: "year",
				sortAccessor: (row) => row.year,
			},
			{
				id: "month",
				header: "Month",
				accessor: (row) => MONTH_LABELS[row.month - 1] ?? String(row.month),
				sortAccessor: (row) => row.month,
				exportAccessor: (row) =>
					MONTH_LABELS[row.month - 1] ?? String(row.month),
			},
			{
				id: "annual_rate_percent",
				header: "Annual rate",
				accessor: (row) => formatRate(row.annual_rate_percent, 2),
				sortAccessor: (row) =>
					row.annual_rate_percent === null
						? null
						: Number(row.annual_rate_percent),
				exportAccessor: (row) => formatRate(row.annual_rate_percent, 2),
			},
			{
				id: "monthly_rate_percent",
				header: "Monthly rate",
				accessor: (row) => formatRate(row.monthly_rate_percent, 4),
				sortAccessor: (row) =>
					row.monthly_rate_percent === null
						? null
						: Number(row.monthly_rate_percent),
				exportAccessor: (row) => formatRate(row.monthly_rate_percent, 4),
			},
		],
		[],
	);

	const data = ratesQuery.data ?? [];

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Mid-term rates"
				subtitle="Applicable federal mid-term rates used for variable interest quotes."
			/>

			{!canView ? (
				<EmptyState
					title="Mid-term rates unavailable"
					message="You do not have permission to view rates."
				/>
			) : ratesQuery.isError ? (
				<EmptyState
					title="Unable to load rates"
					message="We couldn't fetch mid-term rates right now."
					actionLabel="Retry"
					onRetry={() => ratesQuery.refetch()}
				/>
			) : (
				<DataTable
					data={data}
					columns={columns}
					getRowId={(row) => `${row.year}-${row.month}`}
					isLoading={ratesQuery.isLoading}
					emptyMessage="No rates available"
					enableRowSelection={false}
					enableExport
					exportFileName="pbgc-mid-term-rates.csv"
					className="min-h-0 flex-1"
					pagination={{
						enabled: true,
						pageSize:
							typeof persistedPreferences?.pagination?.pageSize === "number"
								? persistedPreferences.pagination.pageSize
								: 12,
						pageSizeOptions: [12, 24, 36, 48],
					}}
					preferences={preferencesConfig}
					headerActions={{
						primaryAction: {
							label: refreshMutation.isPending ? "Refreshing..." : "Refresh",
							onClick: () => refreshMutation.mutate(),
							icon: RefreshCw,
							disabled: !canManage || refreshMutation.isPending,
							variant: "outline",
							size: "sm",
							title: canManage
								? "Fetch latest rates"
								: "You do not have permission to refresh rates",
						},
					}}
				/>
			)}
		</PageContainer>
	);
}
