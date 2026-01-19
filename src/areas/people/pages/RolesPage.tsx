import { useEffect, useMemo, useState } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Button } from "@/shared/ui/Button";
import { ToolbarButton } from "@/shared/ui/toolbar";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import type { PaginationState, VisibilityState } from "@tanstack/react-table";
import { useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "@/auth/hooks";
import { useAuth } from "@/auth/hooks";
import { authKeys } from "@/auth/keys";
import { useTenant } from "@/features/tenancy/hooks";
import {
	useCreateRole,
	useInvalidateOrgPermissions,
	useRolesList,
	useUpdateRole,
} from "@/entities/role/hooks";
import { RolePermissionsDialog } from "@/entities/role/components/RolePermissionsDialog";
import { RoleFormDialog } from "@/entities/role/components/RoleFormDialog";
import { ROLE_TYPE_LABELS, ROLE_TYPE_STYLES } from "@/entities/role/constants";
import { formatDate } from "@/shared/lib/format";
import { loadDataTablePreferences } from "@/shared/ui/Table/constants";
import { useSearchParams } from "react-router-dom";
import type {
	Role,
	RoleFormMode,
	RoleFormValues,
	RoleListParams,
} from "@/entities/role/types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function parsePositiveInt(value: string | null, fallback: number) {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed) || parsed <= 0) return fallback;
	return parsed;
}

export function RolesPage() {
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const { can } = usePermissions();
	const { user } = useAuth();
	const { currentOrgId } = useTenant();
	const queryClient = useQueryClient();
	const [searchParams, setSearchParams] = useSearchParams();
	const preferencesConfig = useMemo(
		() => ({
			id: "roles-list",
			scope: "user" as const,
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
		}),
		[user?.id, user?.org_id]
	);
	const persistedPreferences = useMemo(
		() => loadDataTablePreferences(preferencesConfig),
		[preferencesConfig]
	);
	const preferredPageSize =
		typeof persistedPreferences?.pagination?.pageSize === "number"
			? persistedPreferences.pagination.pageSize
			: DEFAULT_PAGE_SIZE;
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formDialogOpen, setFormDialogOpen] = useState(false);
	const [formMode, setFormMode] = useState<RoleFormMode>("create");
	const [editingRole, setEditingRole] = useState<Role | null>(null);

	const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
	const pageSize = parsePositiveInt(
		searchParams.get("page_size"),
		preferredPageSize
	);

	useEffect(() => {
		const nextParams = new URLSearchParams(searchParams);
		let changed = false;

		if (searchParams.get("page") !== String(page)) {
			nextParams.set("page", String(page));
			changed = true;
		}

		if (searchParams.get("page_size") !== String(pageSize)) {
			nextParams.set("page_size", String(pageSize));
			changed = true;
		}

		if (changed) {
			setSearchParams(nextParams, { replace: true });
		}
	}, [page, pageSize, searchParams, setSearchParams]);

	const listParams = useMemo<RoleListParams>(
		() => ({
			page,
			page_size: pageSize,
		}),
		[page, pageSize]
	);

	const { data, isLoading, isError, error, refetch } = useRolesList(listParams, {
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		if (isError) {
			apiErrorToast(error, "Unable to load roles. Please try again.");
		}
	}, [isError, error, apiErrorToast]);

	const roles = useMemo(() => data?.items ?? [], [data?.items]);
	const totalRows = data?.total ?? data?.items.length ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

	useEffect(() => {
		if (page <= totalPages) return;
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("page", String(totalPages));
		setSearchParams(nextParams, { replace: true });
	}, [page, searchParams, setSearchParams, totalPages]);

	const paginationState = useMemo<PaginationState>(
		() => ({ pageIndex: Math.max(0, page - 1), pageSize }),
		[page, pageSize]
	);

	const handlePaginationChange = (
		updater: PaginationState | ((previous: PaginationState) => PaginationState)
	) => {
		const nextState =
			typeof updater === "function" ? updater(paginationState) : updater;
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("page", String(nextState.pageIndex + 1));
		nextParams.set("page_size", String(nextState.pageSize));
		setSearchParams(nextParams);
	};

	const createMutation = useCreateRole({
		onSuccess: () => {
			toast({
				title: "Role created",
				description: "The new role has been added.",
			});
			setFormDialogOpen(false);
		},
		onError: (err) => {
			apiErrorToast(err, "Unable to create role. Please try again.");
		},
	});

	const updateMutation = useUpdateRole({
		onSuccess: () => {
			toast({
				title: "Role updated",
				description: "Changes have been saved.",
			});
			setFormDialogOpen(false);
			setEditingRole(null);
		},
		onError: (err) => {
			apiErrorToast(err, "Unable to update role. Please try again.");
		},
	});
	const invalidatePermissionsMutation = useInvalidateOrgPermissions({
		onSuccess: (data) => {
			queryClient.invalidateQueries({
				queryKey: authKeys.selfContext(currentOrgId ?? undefined),
			});
			toast({
				title: "Permissions cache cleared",
				description: `${data.cleared} users refreshed.`,
			});
		},
		onError: (err) => {
			apiErrorToast(err, "Unable to invalidate permissions cache.");
		},
	});

	const handleViewPermissions = (role: Role) => {
		setSelectedRole(role);
		setIsDialogOpen(true);
	};

	const handleDialogChange = (open: boolean) => {
		setIsDialogOpen(open);
		if (!open) {
			setSelectedRole(null);
		}
	};

	const handleCreateClick = () => {
		setFormMode("create");
		setEditingRole(null);
		setFormDialogOpen(true);
	};

	const handleEditClick = (role: Role) => {
		if (role.is_system_role) return;
		setFormMode("edit");
		setEditingRole(role);
		setFormDialogOpen(true);
	};

	const handleSubmit = async (values: RoleFormValues, roleId?: string) => {
		if (formMode === "edit" && roleId) {
			await updateMutation.mutateAsync({ id: roleId, payload: values });
		} else {
			await createMutation.mutateAsync(values);
		}
	};

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	const columns = useMemo<ColumnDefinition<Role>[]>(
		() => [
			{
				id: "id",
				header: "ID",
				accessor: (role) => role.id,
				cell: (role) => role.id,
				enableSorting: false,
				enableFiltering: false,
			},
			{
				id: "name",
				header: "Name",
				accessor: (role) => role.name,
				filterAccessor: (role) => role.name,
				cell: (role) => role.name,
				headerClassName: "min-w-[180px]",
				cellClassName: "font-medium",
			},
			{
				id: "description",
				header: "Description",
				accessor: (role) => role.description ?? "",
				filterAccessor: (role) => role.description ?? "",
				cell: (role) => role.description || "—",
				cellClassName: "text-muted-foreground",
			},
			{
				id: "type",
				header: "Type",
				accessor: (role) => (role.is_system_role ? "System" : "Custom"),
				filterAccessor: (role) => (role.is_system_role ? "System" : "Custom"),
				cell: (role) => {
					const typeKey = role.is_system_role ? "system" : "custom";
					return (
						<span
							className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium whitespace-nowrap ${ROLE_TYPE_STYLES[typeKey]}`}
						>
							{ROLE_TYPE_LABELS[typeKey]}
						</span>
					);
				},
				cellClassName: "whitespace-nowrap",
			},
			{
				id: "permissions",
				header: "Permissions",
				accessor: (role) => role.permissions?.length ?? 0,
				cell: (role) => (
					<span className="inline-flex min-w-[2.5rem] items-center justify-center rounded-full bg-muted px-2 py-1 text-xs font-medium">
						{role.permissions?.length ?? 0}
					</span>
				),
			},
			{
				id: "createdAt",
				header: "Created",
				accessor: (role) => role.created_at ?? "",
				cell: (role) => formatDate(role.created_at),
			},
			{
				id: "updatedAt",
				header: "Updated",
				accessor: (role) => role.updated_at ?? "",
				cell: (role) => formatDate(role.updated_at),
			},
		],
		[]
	);

	const initialColumnVisibility = useMemo<VisibilityState>(
		() => ({
			id: false,
		}),
		[]
	);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Roles & permissions"
				subtitle="View system and custom roles with their permission sets."
				actions={
					can(["role.manage", "user.manage"]) ? (
						<Button
							variant="outline"
							size="sm"
							onClick={() => invalidatePermissionsMutation.mutate()}
							disabled={invalidatePermissionsMutation.isPending}
						>
							{invalidatePermissionsMutation.isPending
								? "Refreshing..."
								: "Refresh permissions cache"}
						</Button>
					) : null
				}
			/>
			{isError ? (
				<div className="rounded-xl border border-border/70 bg-card">
					<div className="p-6">
						<p className="text-sm text-muted-foreground">
							Unable to load roles. Please try again.
						</p>
						<Button
							variant="outline"
							size="sm"
							className="mt-3"
							onClick={() => refetch()}
						>
							Retry
						</Button>
					</div>
				</div>
			) : (
				<DataTable
					data={roles}
					columns={columns}
					getRowId={(role) => role.id}
					isLoading={isLoading}
					enableRowSelection
					enableExport={false}
					pagination={{
						enabled: true,
						mode: "server",
						state: paginationState,
						onPaginationChange: handlePaginationChange,
						pageCount: totalPages,
						totalRows,
					}}
					className="flex-1 min-h-0"
					emptyMessage="No roles yet. Create or import roles to manage permissions."
					initialColumnVisibility={initialColumnVisibility}
					preferences={preferencesConfig}
					onRowClick={(role) => handleViewPermissions(role)}
					renderToolbarActions={(selectedRoles) => {
						const hasSingle = selectedRoles.length === 1;
						const selectedRole = hasSingle ? selectedRoles[0] : null;
						return (
							<>
								<ToolbarButton
									variant="outline"
									size="sm"
									disabled={!hasSingle}
									onClick={() => {
										if (selectedRole) {
											handleViewPermissions(selectedRole);
										}
									}}
								>
									View permissions
								</ToolbarButton>
								{can("role.manage") ? (
									<ToolbarButton
										variant="secondary"
										size="sm"
										disabled={
											!hasSingle || Boolean(selectedRole?.is_system_role)
										}
										onClick={() => {
											if (selectedRole) {
												handleEditClick(selectedRole);
											}
										}}
									>
										Edit
									</ToolbarButton>
								) : null}
							</>
						);
					}}
					headerActions={
						can("role.manage")
							? {
									primaryAction: {
										label: "New role",
										onClick: handleCreateClick,
									},
							  }
							: undefined
					}
				/>
			)}

			<RolePermissionsDialog
				role={selectedRole}
				open={isDialogOpen}
				onOpenChange={handleDialogChange}
			/>

			<RoleFormDialog
				mode={formMode}
				open={formDialogOpen}
				onOpenChange={setFormDialogOpen}
				initialRole={editingRole}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
			/>
		</PageContainer>
	);
}
