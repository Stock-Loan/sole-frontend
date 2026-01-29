import { useEffect, useMemo, useState } from "react";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import { Badge } from "@/shared/ui/badge";
import { ToolbarButton } from "@/shared/ui/toolbar";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { formatDate } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import { usePermissions, useAuth } from "@/auth/hooks";
import { useOrgUsersList } from "@/entities/user/hooks";
import { useAclAssignments, useDeleteAclAssignment } from "@/entities/acl/hooks";
import { AclPermissionTags } from "@/entities/acl/components/AclPermissionTags";
import type { AclAssignment } from "@/entities/acl/types";
import {
	formatAclExpiresAt,
	getAssignmentUserLabel,
	isAclExpired,
} from "@/entities/acl/utils";
import { AclAssignmentDialog } from "@/areas/settings/components/AclAssignmentDialog";
import { AclAssignmentDeleteDialog } from "@/areas/settings/components/AclAssignmentDeleteDialog";
import { AclUserPermissionsDialog } from "@/areas/settings/components/AclUserPermissionsDialog";

export function AclAssignmentsPage() {
	const { can } = usePermissions();
	const { user } = useAuth();
	const apiErrorToast = useApiErrorToast();
	const canManage = can("acl.manage");

	const assignmentsQuery = useAclAssignments();
	const usersQuery = useOrgUsersList({ page: 1, page_size: 1 });
	const deleteMutation = useDeleteAclAssignment();

	const assignments = useMemo(
		() => assignmentsQuery.data?.items ?? [],
		[assignmentsQuery.data?.items],
	);
	const hasUsers =
		(usersQuery.data?.total ??
			usersQuery.data?.items?.length ??
			0) > 0;

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<"create" | "edit">("create");
	const [activeAssignment, setActiveAssignment] = useState<AclAssignment | null>(
		null,
	);
	const [deleteTarget, setDeleteTarget] = useState<AclAssignment | null>(null);
	const [permissionsTarget, setPermissionsTarget] =
		useState<AclAssignment | null>(null);
	const [selectionResetKey, setSelectionResetKey] = useState(0);

	useEffect(() => {
		if (assignmentsQuery.isError) {
			apiErrorToast(
				assignmentsQuery.error,
				"Unable to load ACL assignments.",
			);
		}
	}, [apiErrorToast, assignmentsQuery.error, assignmentsQuery.isError]);

	useEffect(() => {
		if (usersQuery.isError) {
			apiErrorToast(usersQuery.error, "Unable to load users.");
		}
	}, [apiErrorToast, usersQuery.error, usersQuery.isError]);

	const columns = useMemo<ColumnDefinition<AclAssignment>[]>(
		() => [
			{
				id: "user",
				header: "User",
				accessor: (row) => getAssignmentUserLabel(row),
				filterAccessor: (row) =>
					`${row.full_name ?? ""} ${row.email ?? ""}`.trim(),
				cell: (row) => (
					<div className="space-y-1">
						<div className="font-semibold text-foreground">
							{getAssignmentUserLabel(row)}
						</div>
						{row.email ? (
							<div className="text-xs text-muted-foreground">{row.email}</div>
						) : null}
					</div>
				),
				headerClassName: "min-w-[220px] whitespace-nowrap",
			},
			{
				id: "permissions",
				header: "Permissions",
				accessor: (row) => row.permissions.join(", "),
				filterAccessor: (row) => row.permissions.join(" "),
				cell: (row) => (
					<AclPermissionTags permissions={row.permissions} />
				),
				headerClassName: "min-w-[240px] whitespace-nowrap",
			},
			{
				id: "effect",
				header: "Effect",
				accessor: (row) => row.effect,
				filterAccessor: (row) => row.effect,
				cell: (row) => (
					<Badge variant={row.effect === "deny" ? "destructive" : "outline"}>
						{normalizeDisplay(row.effect)}
					</Badge>
				),
				headerClassName: "whitespace-nowrap",
			},
			{
				id: "expires",
				header: "Expires",
				accessor: (row) => row.expires_at ?? "",
				filterAccessor: (row) =>
					`${formatAclExpiresAt(row.expires_at)} ${
						isAclExpired(row.expires_at) ? "expired" : "active"
					}`.trim(),
				cell: (row) => {
					const expired = isAclExpired(row.expires_at);
					return (
						<div className="space-y-1">
							<span
								className={
									expired ? "text-destructive font-semibold" : "text-foreground"
								}
							>
								{formatAclExpiresAt(row.expires_at)}
							</span>
							{expired ? (
								<span className="text-xs text-destructive">Expired</span>
							) : null}
						</div>
					);
				},
				headerClassName: "whitespace-nowrap",
			},
			{
				id: "updated_at",
				header: "Updated",
				accessor: (row) => row.updated_at ?? "",
				cell: (row) => formatDate(row.updated_at),
				headerClassName: "whitespace-nowrap",
			},
		],
		[],
	);

	const handleAdd = () => {
		setDialogMode("create");
		setActiveAssignment(null);
		setDialogOpen(true);
	};

	const handleDelete = (assignment: AclAssignment) => {
		deleteMutation.mutate(assignment.id, {
			onSuccess: () => {
				setDeleteTarget(null);
				setSelectionResetKey((prev) => prev + 1);
			},
			onError: (error) => {
				apiErrorToast(error, "Unable to remove assignment.");
			},
		});
	};

	if (!canManage) {
		return (
			<PageContainer>
				<EmptyState message="You do not have access to ACL assignments." />
			</PageContainer>
		);
	}

	const emptyMessage = !hasUsers
		? "No users found. Create users first before assigning direct permissions."
		: "No ACL assignments yet.";

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="ACL Assignments"
				subtitle="Manage direct permission grants for users in your organization."
			/>
			<DataTable
				data={assignments}
				columns={columns}
				getRowId={(row) => row.id}
				isLoading={assignmentsQuery.isLoading}
				emptyMessage={emptyMessage}
				enableRowSelection
				enableExport={false}
				className="min-h-0 flex-1"
				headerActions={{
					primaryAction: {
						label: "Add assignment",
						onClick: handleAdd,
						disabled: !hasUsers,
						variant: "default",
						size: "sm",
					},
				}}
				renderToolbarActions={(selectedAssignments) => {
					const single =
						selectedAssignments.length === 1
							? selectedAssignments[0]
							: null;

					return (
						<div className="flex items-center gap-2">
							<ToolbarButton
								variant="outline"
								size="sm"
								disabled={!single}
								onClick={() => {
									if (!single) return;
									setPermissionsTarget(single);
								}}
							>
								View permissions
							</ToolbarButton>
							<ToolbarButton
								variant="outline"
								size="sm"
								disabled={!single}
								onClick={() => {
									if (!single) return;
									setDialogMode("edit");
									setActiveAssignment(single);
									setDialogOpen(true);
								}}
							>
								Edit
							</ToolbarButton>
							<ToolbarButton
								variant="destructive"
								size="sm"
								disabled={!single}
								onClick={() => {
									if (!single) return;
									setDeleteTarget(single);
								}}
							>
								Remove
							</ToolbarButton>
						</div>
					);
				}}
				selectionResetKey={selectionResetKey}
				preferences={{
					id: "acl-assignments",
					scope: "user",
					userKey: user?.id ?? null,
					orgKey: user?.org_id ?? null,
					version: 1,
				}}
			/>
			<AclAssignmentDialog
				open={dialogOpen}
				onOpenChange={setDialogOpen}
				mode={dialogMode}
				assignment={activeAssignment}
				onSuccess={() => {
					setDialogOpen(false);
					setSelectionResetKey((prev) => prev + 1);
				}}
			/>
			<AclAssignmentDeleteDialog
				open={Boolean(deleteTarget)}
				onOpenChange={(open) => setDeleteTarget(open ? deleteTarget : null)}
				assignment={deleteTarget}
				onConfirm={handleDelete}
				isLoading={deleteMutation.isPending}
			/>
			<AclUserPermissionsDialog
				open={Boolean(permissionsTarget)}
				onOpenChange={(open) => setPermissionsTarget(open ? permissionsTarget : null)}
				assignment={permissionsTarget}
				assignments={assignments}
			/>
		</PageContainer>
	);
}
