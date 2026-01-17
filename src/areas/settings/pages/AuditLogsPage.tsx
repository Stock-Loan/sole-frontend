import { useEffect, useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type {
	ColumnDefinition,
	DataTablePreferencesConfig,
} from "@/shared/ui/Table/types";
import { loadDataTablePreferences } from "@/shared/ui/Table/constants";
import { usePermissions } from "@/auth/hooks";
import { useAuth } from "@/auth/hooks";
import { useOrgAuditLogs } from "@/entities/audit/hooks";
import type { AuditLog } from "@/entities/audit/types";
import { formatAuditValue, stringifyAuditValue } from "@/entities/audit/utils";
import { formatDate } from "@/shared/lib/format";
import { Label } from "@/shared/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";

export function AuditLogsPage() {
	const apiErrorToast = useApiErrorToast();
	const { can } = usePermissions();
	const { user } = useAuth();
	const canViewAuditLogs = can("audit_log.view");

	const preferencesConfig = useMemo<DataTablePreferencesConfig>(
		() => ({
			id: "audit-logs",
			scope: "user",
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
			version: 1,
		}),
		[user?.id, user?.org_id]
	);
	const persistedPreferences = useMemo(
		() => loadDataTablePreferences(preferencesConfig),
		[preferencesConfig]
	);

	const defaultPageSize =
		typeof persistedPreferences?.pagination?.pageSize === "number"
			? persistedPreferences.pagination.pageSize
			: 50;

	const [paginationState, setPaginationState] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: defaultPageSize,
	});
	const [resourceType, setResourceType] = useState("all");
	const handleResourceTypeChange = (value: string) => {
		setResourceType(value);
		setPaginationState((prev) =>
			prev.pageIndex === 0 ? prev : { ...prev, pageIndex: 0 }
		);
	};

	const listParams = useMemo(
		() => ({
			page: paginationState.pageIndex + 1,
			page_size: paginationState.pageSize,
			resource_type: resourceType === "all" ? undefined : resourceType,
		}),
		[paginationState.pageIndex, paginationState.pageSize, resourceType]
	);

	const auditLogsQuery = useOrgAuditLogs(listParams, {
		enabled: canViewAuditLogs,
	});

	useEffect(() => {
		if (auditLogsQuery.isError) {
			apiErrorToast(
				auditLogsQuery.error,
				"Unable to load audit logs. Please try again."
			);
		}
	}, [apiErrorToast, auditLogsQuery.error, auditLogsQuery.isError]);

	const auditLogs = useMemo(
		() => auditLogsQuery.data?.items ?? [],
		[auditLogsQuery.data?.items]
	);
	const totalRows = auditLogsQuery.data?.total ?? auditLogs.length;
	const totalPages = Math.max(
		1,
		Math.ceil(totalRows / paginationState.pageSize)
	);

	const resourceTypeOptions = useMemo(() => {
		const types = new Set<string>();
		auditLogs.forEach((log) => {
			if (log.resource_type) {
				types.add(log.resource_type);
			}
		});
		if (resourceType !== "all") {
			types.add(resourceType);
		}
		return Array.from(types).sort((a, b) => a.localeCompare(b));
	}, [auditLogs, resourceType]);

	const columns = useMemo<ColumnDefinition<AuditLog>[]>(
		() => [
			{
				id: "actor_name",
				header: "Actor",
				accessor: (log) => log.actor?.full_name ?? "",
				cell: (log) => log.actor?.full_name ?? "—",
				headerClassName: "min-w-[180px] whitespace-nowrap",
			},
			{
				id: "actor_email",
				header: "Actor email",
				accessor: (log) => log.actor?.email ?? "",
				cell: (log) => log.actor?.email ?? "—",
				headerClassName: "min-w-[200px] whitespace-nowrap",
				cellClassName: "text-xs text-muted-foreground break-all",
			},
			{
				id: "action",
				header: "Action",
				accessor: (log) => log.action,
				cell: (log) => log.action,
				headerClassName: "min-w-[180px] whitespace-nowrap",
			},
			{
				id: "resource_type",
				header: "Resource type",
				accessor: (log) => log.resource_type ?? "",
				cell: (log) => log.resource_type ?? "—",
				headerClassName: "whitespace-nowrap",
			},
			{
				id: "resource_id",
				header: "Resource ID",
				accessor: (log) => log.resource_id ?? "",
				cell: (log) => log.resource_id ?? "—",
				headerClassName: "min-w-[180px] whitespace-nowrap",
				cellClassName: "text-xs text-muted-foreground break-all",
			},
			{
				id: "actor_id",
				header: "Actor ID",
				accessor: (log) => log.actor?.user_id ?? log.actor_id ?? "",
				cell: (log) => log.actor?.user_id ?? log.actor_id ?? "—",
				headerClassName: "min-w-[180px] whitespace-nowrap",
				cellClassName: "text-xs text-muted-foreground break-all",
			},
			{
				id: "created_at",
				header: "Created",
				accessor: (log) => log.created_at,
				cell: (log) => formatDate(log.created_at),
				headerClassName: "whitespace-nowrap",
			},
			{
				id: "old_value",
				header: "Old value",
				accessor: (log) => log.old_value ?? null,
				cell: (log) => (
					<span title={stringifyAuditValue(log.old_value)}>
						{formatAuditValue(log.old_value)}
					</span>
				),
				exportAccessor: (log) => stringifyAuditValue(log.old_value),
				cellClassName: "text-xs text-muted-foreground break-all",
				headerClassName: "min-w-[200px] whitespace-nowrap",
			},
			{
				id: "new_value",
				header: "New value",
				accessor: (log) => log.new_value ?? null,
				cell: (log) => (
					<span title={stringifyAuditValue(log.new_value)}>
						{formatAuditValue(log.new_value)}
					</span>
				),
				exportAccessor: (log) => stringifyAuditValue(log.new_value),
				cellClassName: "text-xs text-muted-foreground break-all",
				headerClassName: "min-w-[200px] whitespace-nowrap",
			},
		],
		[]
	);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Audit logs"
				subtitle="Track admin actions and configuration changes."
			/>

			{!canViewAuditLogs ? (
				<EmptyState
					title="Audit logs unavailable"
					message="You do not have permission to view audit logs."
				/>
			) : (
				<>
					{auditLogsQuery.isError ? (
						<EmptyState
							title="Unable to load audit logs"
							message="We couldn't fetch audit logs right now."
							actionLabel="Retry"
							onRetry={() => auditLogsQuery.refetch()}
						/>
					) : (
						<DataTable
							data={auditLogs}
							columns={columns}
							getRowId={(log) => log.id}
							isLoading={auditLogsQuery.isLoading}
							emptyMessage="No audit log entries found."
							enableRowSelection={false}
							enableExport
							exportFileName="audit-logs.csv"
							className="min-h-0 flex-1"
							preferences={preferencesConfig}
							headerFilters={
								<>
									<Label
										htmlFor="audit-resource-type"
										className="text-xs text-muted-foreground"
									>
										Resource
									</Label>
									<Select
										value={resourceType}
										onValueChange={handleResourceTypeChange}
									>
										<SelectTrigger
											id="audit-resource-type"
											className="h-9 w-[220px]"
										>
											<SelectValue placeholder="All resource types" />
										</SelectTrigger>
										<SelectContent className="max-h-64">
											<SelectItem value="all">
												All resource types
											</SelectItem>
											{resourceTypeOptions.map((type) => (
												<SelectItem key={type} value={type}>
													{type}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</>
							}
							initialColumnVisibility={{
								actor_email: false,
								actor_id: false,
								old_value: false,
								new_value: false,
							}}
							pagination={{
								enabled: true,
								mode: "server",
								state: paginationState,
								onPaginationChange: setPaginationState,
								pageCount: totalPages,
								totalRows,
								pageSizeOptions: [20, 50, 100, 200],
							}}
						/>
					)}
				</>
			)}
		</PageContainer>
	);
}
