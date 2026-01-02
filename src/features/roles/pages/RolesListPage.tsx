import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { ToolbarButton } from "@/components/ui/toolbar";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { queryKeys } from "@/lib/queryKeys";
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDefinition } from "@/components/data-table/types";
import type { VisibilityState } from "@tanstack/react-table";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createRole, listRoles, updateRole } from "../api/roles.api";
import { RolePermissionsDialog } from "../components/RolePermissionsDialog";
import { RoleFormDialog } from "../components/RoleFormDialog";
import { ROLE_TYPE_LABELS, ROLE_TYPE_STYLES } from "../constants";
import { formatDate } from "@/lib/format";
import type { Role, RoleFormMode, RoleFormValues } from "../types";

export function RolesListPage() {
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const { can } = usePermissions();
	const { user } = useAuth();
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formDialogOpen, setFormDialogOpen] = useState(false);
	const [formMode, setFormMode] = useState<RoleFormMode>("create");
	const [editingRole, setEditingRole] = useState<Role | null>(null);

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: queryKeys.roles.list(),
		queryFn: listRoles,
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		if (isError) {
			apiErrorToast(error, "Unable to load roles. Please try again.");
		}
	}, [isError, error, apiErrorToast]);

	const roles = useMemo(() => data?.items ?? [], [data?.items]);

	const createMutation = useMutation({
		mutationFn: (values: RoleFormValues) => createRole(values),
		onSuccess: () => {
			toast({
				title: "Role created",
				description: "The new role has been added.",
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() });
			setFormDialogOpen(false);
		},
		onError: (err) => {
			apiErrorToast(err, "Unable to create role. Please try again.");
		},
	});

	const updateMutation = useMutation({
		mutationFn: ({ roleId, values }: { roleId: string; values: RoleFormValues }) =>
			updateRole(roleId, values),
		onSuccess: () => {
			toast({
				title: "Role updated",
				description: "Changes have been saved.",
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.roles.list() });
			setFormDialogOpen(false);
			setEditingRole(null);
		},
		onError: (err) => {
			apiErrorToast(err, "Unable to update role. Please try again.");
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
			await updateMutation.mutateAsync({ roleId, values });
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
	const preferencesConfig = useMemo(
		() => ({
			id: "roles-list",
			scope: "user" as const,
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
		}),
		[user?.id, user?.org_id]
	);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Roles & permissions"
				subtitle="View system and custom roles with their permission sets."
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
					className="flex-1 min-h-0"
					emptyMessage="No roles yet. Create or import roles to manage permissions."
					initialColumnVisibility={initialColumnVisibility}
					preferences={preferencesConfig}
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
					topBarActions={
						can("role.manage") ? (
							<Button
								size="sm"
								variant="default"
								className="h-8 px-3 text-xs"
								onClick={handleCreateClick}
							>
								New role
							</Button>
						) : null
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
