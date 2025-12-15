import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { queryKeys } from "@/lib/queryKeys";
import { createRole, listRoles, updateRole } from "../api/roles.api";
import { RolePermissionsDialog } from "../components/RolePermissionsDialog";
import { RolesTable } from "../components/RolesTable";
import { RoleFormDialog } from "../components/RoleFormDialog";
import { RolesFilters } from "../components/RolesFilters";
import type {
	Role,
	RoleFilterType,
	RoleFormMode,
	RoleFormValues,
} from "../types";

export function RolesListPage() {
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [formDialogOpen, setFormDialogOpen] = useState(false);
	const [formMode, setFormMode] = useState<RoleFormMode>("create");
	const [editingRole, setEditingRole] = useState<Role | null>(null);
	const [search, setSearch] = useState("");
	const [roleType, setRoleType] = useState<RoleFilterType>("ALL");

	const { data, isLoading, isError, isFetching, error, refetch } = useQuery({
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
	const filteredRoles = useMemo(() => {
		const term = search.trim().toLowerCase();
		return roles.filter((role) => {
			const matchesSearch =
				!term ||
				role.name.toLowerCase().includes(term) ||
				(role.description ?? "").toLowerCase().includes(term);
			const matchesType =
				roleType === "ALL"
					? true
					: roleType === "SYSTEM"
						? role.is_system_role
						: !role.is_system_role;
			return matchesSearch && matchesType;
		});
	}, [roles, search, roleType]);

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

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Roles & permissions"
				subtitle="View system and custom roles with their permission sets."
				actions={
					<div className="flex items-center gap-2">
						<Button onClick={handleCreateClick} size="sm">
							New role
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							disabled={isFetching}
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh
						</Button>
					</div>
				}
			/>

			<RolesFilters
				search={search}
				onSearchChange={setSearch}
				type={roleType}
				onTypeChange={setRoleType}
			/>

			<RolesTable
				roles={filteredRoles}
				isLoading={isLoading}
				isError={isError}
				isFetching={isFetching}
				onRetry={refetch}
				onViewPermissions={handleViewPermissions}
				onEdit={handleEditClick}
			/>

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
