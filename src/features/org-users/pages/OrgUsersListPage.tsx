import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { Link, useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/data-table/DataTable";
import type {
	ColumnDefinition,
	DataTablePreferencesConfig,
} from "@/components/data-table/types";
import { loadDataTablePreferences } from "@/components/data-table/constants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { ToolbarButton } from "@/components/ui/toolbar";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";
import { normalizeDisplay } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AddUserDialog } from "../components/AddUserDialog";
import { listOrgUsers, onboardOrgUser } from "../api/orgUsers.api";
import { useBulkDeleteOrgUsers, useDeleteOrgUser } from "../hooks/useOrgUsers";
import type {
	OnboardUserPayload,
	OrgUserListItem,
	OrgUsersListParams,
} from "../types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

function parsePositiveInt(value: string | null, fallback: number) {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed) || parsed <= 0) return fallback;
	return parsed;
}

function getDisplayName(user: OrgUserListItem["user"]) {
	return (
		user.full_name ||
		[user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
		user.email
	);
}

function getDepartmentLabel(membership: OrgUserListItem["membership"]) {
	return (
		membership.department_name ||
		membership.department ||
		membership.department_id ||
		"—"
	);
}

const columns: ColumnDefinition<OrgUserListItem>[] = [
	{
		id: "fullName",
		header: "Full name",
		accessor: (row) => getDisplayName(row.user),
		filterAccessor: (row) =>
			`${getDisplayName(row.user)} ${row.user.email}`.trim(),
		cell: (row) => (
			<Link
				to={routes.userDetail.replace(":membershipId", row.membership.id)}
				className="font-semibold text-primary underline-offset-4 hover:underline"
			>
				{getDisplayName(row.user)}
			</Link>
		),
		headerClassName: "min-w-[200px]",
	},
	{
		id: "employeeId",
		header: "Employee ID",
		accessor: (row) => row.membership.employee_id ?? "",
		cell: (row) => row.membership.employee_id || "—",
	},
	{
		id: "email",
		header: "Email",
		accessor: (row) => row.user.email,
		cell: (row) => row.user.email,
	},
	{
		id: "department",
		header: "Department",
		accessor: (row) => getDepartmentLabel(row.membership),
		cell: (row) => getDepartmentLabel(row.membership),
	},
	{
		id: "employmentStatus",
		header: "Employment status",
		accessor: (row) => row.membership.employment_status ?? "",
		filterAccessor: (row) => row.membership.employment_status ?? "",
		cell: (row) => (
			<Badge variant="outline">
				{normalizeDisplay(row.membership.employment_status)}
			</Badge>
		),
	},
	{
		id: "platformStatus",
		header: "Platform status",
		accessor: (row) => row.membership.platform_status ?? "",
		filterAccessor: (row) => row.membership.platform_status ?? "",
		cell: (row) => (
			<Badge variant="outline">
				{normalizeDisplay(row.membership.platform_status)}
			</Badge>
		),
	},
];

export function OrgUsersListPage() {
	const { user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const apiErrorToast = useApiErrorToast();
	const { toast } = useToast();
	const queryClient = useQueryClient();
	const deleteOrgUserMutation = useDeleteOrgUser();
	const bulkDeleteOrgUsersMutation = useBulkDeleteOrgUsers();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<OrgUserListItem[]>([]);
	const [addUserOpen, setAddUserOpen] = useState(false);

	const onboardUserMutation = useMutation({
		mutationFn: onboardOrgUser,
		onSuccess: () => {
			toast({
				title: "User onboarded",
				description: "The user has been added to this organization.",
			});
			queryClient.invalidateQueries({ queryKey: queryKeys.orgUsers.list() });
		},
	});

	const preferencesConfig = useMemo<DataTablePreferencesConfig>(
		() => ({
			id: "org-users-list",
			scope: "user",
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

	const listParams = useMemo<OrgUsersListParams>(
		() => ({
			page,
			page_size: pageSize,
		}),
		[page, pageSize]
	);

	const { data, isLoading, isError, error, refetch } = useQuery({
		queryKey: queryKeys.orgUsers.list(listParams),
		queryFn: () => listOrgUsers(listParams),
		placeholderData: (previous) => previous,
	});

	const totalRows = data?.total ?? data?.items.length ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

	useEffect(() => {
		if (page <= totalPages) return;
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("page", String(totalPages));
		setSearchParams(nextParams, { replace: true });
	}, [page, searchParams, setSearchParams, totalPages]);

	useEffect(() => {
		if (!isError) return;
		apiErrorToast(error, "Unable to load organization users.");
	}, [apiErrorToast, error, isError]);

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

	const isDeleting =
		deleteOrgUserMutation.isPending || bulkDeleteOrgUsersMutation.isPending;

	const openDeleteDialog = (selectedRows: OrgUserListItem[]) => {
		if (selectedRows.length === 0) return;
		setPendingDelete(selectedRows);
		setDeleteDialogOpen(true);
	};

	const handleDeleteDialogChange = (open: boolean) => {
		setDeleteDialogOpen(open);
		if (!open) {
			setPendingDelete([]);
		}
	};

	const handleConfirmDelete = () => {
		if (!pendingDelete.length) return;
		const membershipIds = Array.from(
			new Set(pendingDelete.map((row) => row.membership.id))
		);
		const closeDialog = () => {
			setDeleteDialogOpen(false);
			setPendingDelete([]);
		};
		if (membershipIds.length === 1) {
			deleteOrgUserMutation.mutate(membershipIds[0], {
				onSuccess: closeDialog,
			});
			return;
		}
		bulkDeleteOrgUsersMutation.mutate(membershipIds, {
			onSuccess: closeDialog,
		});
	};

	const renderToolbarActions = (selectedRows: OrgUserListItem[]) => (
		<ToolbarButton
			variant="destructive"
			size="sm"
			disabled={isDeleting}
			onClick={() => openDeleteDialog(selectedRows)}
		>
			{selectedRows.length === 1 ? "Delete user" : "Delete users"}
		</ToolbarButton>
	);

	const pendingDeleteCount = pendingDelete.length;
	const pendingDeleteLabel =
		pendingDeleteCount === 1
			? getDisplayName(pendingDelete[0].user)
			: `${pendingDeleteCount} users`;

	const handleAddUser = async (values: OnboardUserPayload) => {
		await onboardUserMutation.mutateAsync(values);
	};

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Org users"
				subtitle="View organization users and core statuses."
				actions={
					<Button asChild variant="outline" size="sm">
						<Link to={routes.usersOnboard}>Bulk user onboarding</Link>
					</Button>
				}
			/>
			{isError ? (
				<EmptyState
					title="Unable to load users"
					message="We couldn't load organization users right now. Please try again."
					actionLabel="Retry"
					onRetry={refetch}
				/>
			) : (
				<DataTable
					data={data?.items ?? []}
					columns={columns}
					getRowId={(row) => row.membership.id}
					isLoading={isLoading}
					emptyMessage="No users found for this organization."
					exportFileName="org-users.csv"
					preferences={preferencesConfig}
					className="flex-1 min-h-0"
					topBarActions={
						<AddUserDialog
							open={addUserOpen}
							onOpenChange={setAddUserOpen}
							onSubmit={handleAddUser}
							trigger={
								<Button
									size="sm"
									variant="default"
									className="h-8 px-3 text-xs"
								>
									Add user
								</Button>
							}
						/>
					}
					renderToolbarActions={renderToolbarActions}
					pagination={{
						enabled: true,
						mode: "server",
						state: paginationState,
						onPaginationChange: handlePaginationChange,
						pageCount: totalPages,
						totalRows,
						pageSizeOptions: PAGE_SIZE_OPTIONS,
					}}
				/>
			)}
			<Dialog open={deleteDialogOpen} onOpenChange={handleDeleteDialogChange}>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>
							{pendingDeleteCount === 1
								? `Delete ${pendingDeleteLabel}`
								: `Delete ${pendingDeleteLabel}`}
						</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<p className="text-sm text-muted-foreground">
							{pendingDeleteCount === 1
								? `You’re about to remove ${pendingDeleteLabel} from this organization.`
								: `You’re about to remove ${pendingDeleteLabel} from this organization.`}{" "}
							This action cannot be undone.
						</p>
						<p className="text-sm text-muted-foreground mt-1">
							Deleted users will lose access immediately. If this is a mistake,
							you’ll need to re-invite them.
						</p>
					</DialogBody>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleDeleteDialogChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeleting}
							onClick={handleConfirmDelete}
						>
							{isDeleting ? "Deleting..." : "Confirm delete"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
