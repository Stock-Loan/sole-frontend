import { useEffect, useMemo, useState } from "react";
import type { PaginationState, VisibilityState } from "@tanstack/react-table";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type {
	ColumnDefinition,
	DataTablePreferencesConfig,
} from "@/shared/ui/Table/types";
import { loadDataTablePreferences } from "@/shared/ui/Table/constants";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/input";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { ToolbarButton } from "@/shared/ui/toolbar";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { routes } from "@/shared/lib/routes";
import { normalizeDisplay } from "@/shared/lib/utils";
import { formatDate } from "@/shared/lib/format";
import { useToast } from "@/shared/ui/use-toast";
import { useAuth, usePermissions } from "@/auth/hooks";
import { AddUserDialog } from "@/entities/user/components/AddUserDialog";
import {
	useBulkDeleteOrgUsers,
	useDeleteOrgUser,
	useOnboardUser,
	useOrgUsersList,
} from "@/entities/user/hooks";
import { AssignDepartmentDialog } from "@/entities/department/components/AssignDepartmentDialog";
import { ManageRolesDialog } from "@/entities/role/components/ManageRolesDialog";
import type {
	OnboardUserPayload,
	OrgUserListItem,
	OrgUsersListParams,
} from "@/entities/user/types";

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

function getRoleLabels(roles: OrgUserListItem["roles"]) {
	if (!roles || roles.length === 0) return "—";
	const labels = roles
		.map((role) => (typeof role === "string" ? role : (role.name ?? role.id)))
		.filter((value): value is string => Boolean(value?.trim()))
		.map((value) => normalizeDisplay(value.toLowerCase()));

	return labels.length > 0 ? labels.join(", ") : "—";
}

function formatYesNo(value?: boolean | null) {
	if (value === null || value === undefined) return "—";
	return value ? "Yes" : "No";
}

function getCountryName(user: OrgUserListItem["user"]) {
	return user.country_name || user.country || "—";
}

function getStateName(user: OrgUserListItem["user"]) {
	return user.state_name || user.state || "—";
}

function getCountryCode(user: OrgUserListItem["user"]) {
	return user.country_code || "—";
}

function getStateCode(user: OrgUserListItem["user"]) {
	return user.state_code || "—";
}

const columns: ColumnDefinition<OrgUserListItem>[] = [
	{
		id: "fullName",
		header: "Full name",
		accessor: (row) => getDisplayName(row.user),
		filterAccessor: (row) =>
			`${getDisplayName(row.user)} ${row.user.email}`.trim(),
		cell: (row) => (
			<span className="font-medium text-foreground">
				{getDisplayName(row.user)}
			</span>
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
		id: "preferredName",
		header: "Preferred name",
		accessor: (row) => row.user.preferred_name ?? "",
		cell: (row) => row.user.preferred_name || "—",
	},
	{
		id: "email",
		header: "Email",
		accessor: (row) => row.user.email,
		cell: (row) => row.user.email,
	},
	{
		id: "phoneNumber",
		header: "Phone",
		accessor: (row) => row.user.phone_number ?? "",
		cell: (row) => row.user.phone_number || "—",
	},
	{
		id: "timezone",
		header: "Timezone",
		accessor: (row) => row.user.timezone ?? "",
		cell: (row) => row.user.timezone || "—",
	},
	{
		id: "department",
		header: "Department",
		accessor: (row) => getDepartmentLabel(row.membership),
		cell: (row) => getDepartmentLabel(row.membership),
	},
	{
		id: "departmentId",
		header: "Department ID",
		accessor: (row) => row.membership.department_id ?? "",
		cell: (row) => row.membership.department_id || "—",
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
		id: "employmentStartDate",
		header: "Employment start",
		accessor: (row) => row.membership.employment_start_date ?? "",
		cell: (row) => formatDate(row.membership.employment_start_date),
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
	{
		id: "invitationStatus",
		header: "Invitation status",
		accessor: (row) => row.membership.invitation_status ?? "",
		filterAccessor: (row) => row.membership.invitation_status ?? "",
		cell: (row) => (
			<Badge variant="outline">
				{normalizeDisplay(row.membership.invitation_status)}
			</Badge>
		),
	},
	{
		id: "roles",
		header: "Roles",
		accessor: (row) => getRoleLabels(row.roles),
		filterAccessor: (row) => getRoleLabels(row.roles),
		cell: (row) => getRoleLabels(row.roles),
	},
	{
		id: "invitedAt",
		header: "Invited at",
		accessor: (row) => row.membership.invited_at ?? "",
		cell: (row) => formatDate(row.membership.invited_at),
	},
	{
		id: "acceptedAt",
		header: "Accepted at",
		accessor: (row) => row.membership.accepted_at ?? "",
		cell: (row) => formatDate(row.membership.accepted_at),
	},
	{
		id: "membershipCreatedAt",
		header: "Membership created",
		accessor: (row) => row.membership.created_at ?? "",
		cell: (row) => formatDate(row.membership.created_at),
	},
	{
		id: "userCreatedAt",
		header: "User created",
		accessor: (row) => row.user.created_at ?? "",
		cell: (row) => formatDate(row.user.created_at),
	},
	{
		id: "maritalStatus",
		header: "Marital status",
		accessor: (row) => row.user.marital_status ?? "",
		cell: (row) => normalizeDisplay(row.user.marital_status),
	},
	{
		id: "country",
		header: "Country",
		accessor: (row) => getCountryName(row.user),
		cell: (row) => getCountryName(row.user),
	},
	{
		id: "state",
		header: "State",
		accessor: (row) => getStateName(row.user),
		cell: (row) => getStateName(row.user),
	},
	{
		id: "countryCode",
		header: "Country code",
		accessor: (row) => row.user.country_code ?? "",
		cell: (row) => getCountryCode(row.user),
	},
	{
		id: "stateCode",
		header: "State code",
		accessor: (row) => row.user.state_code ?? "",
		cell: (row) => getStateCode(row.user),
	},
	{
		id: "addressLine1",
		header: "Address line 1",
		accessor: (row) => row.user.address_line1 ?? "",
		cell: (row) => row.user.address_line1 || "—",
	},
	{
		id: "addressLine2",
		header: "Address line 2",
		accessor: (row) => row.user.address_line2 ?? "",
		cell: (row) => row.user.address_line2 || "—",
	},
	{
		id: "postalCode",
		header: "Postal code",
		accessor: (row) => row.user.postal_code ?? "",
		cell: (row) => row.user.postal_code || "—",
	},
	{
		id: "firstName",
		header: "First name",
		accessor: (row) => row.user.first_name ?? "",
		cell: (row) => row.user.first_name || "—",
	},
	{
		id: "middleName",
		header: "Middle name",
		accessor: (row) => row.user.middle_name ?? "",
		cell: (row) => row.user.middle_name || "—",
	},
	{
		id: "lastName",
		header: "Last name",
		accessor: (row) => row.user.last_name ?? "",
		cell: (row) => row.user.last_name || "—",
	},
	{
		id: "isActive",
		header: "User active",
		accessor: (row) => formatYesNo(row.user.is_active),
		cell: (row) => formatYesNo(row.user.is_active),
	},
	{
		id: "isSuperuser",
		header: "Superuser",
		accessor: (row) => formatYesNo(row.user.is_superuser),
		cell: (row) => formatYesNo(row.user.is_superuser),
	},
	{
		id: "userId",
		header: "User ID",
		accessor: (row) => row.user.id,
		cell: (row) => row.user.id,
	},
	{
		id: "membershipId",
		header: "Membership ID",
		accessor: (row) => row.membership.id,
		cell: (row) => row.membership.id,
	},
	{
		id: "orgId",
		header: "Org ID",
		accessor: (row) => row.membership.org_id ?? row.user.org_id ?? "",
		cell: (row) => row.membership.org_id ?? row.user.org_id ?? "—",
	},
	{
		id: "orgName",
		header: "Organization",
		accessor: (row) => row.user.org_name ?? "",
		cell: (row) => row.user.org_name ?? "—",
	},
];

export function UsersListPage() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const { toast } = useToast();
	const { can } = usePermissions();
	const [searchParams, setSearchParams] = useSearchParams();
	const apiErrorToast = useApiErrorToast();
	const deleteOrgUserMutation = useDeleteOrgUser();
	const bulkDeleteOrgUsersMutation = useBulkDeleteOrgUsers();
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [pendingDelete, setPendingDelete] = useState<OrgUserListItem[]>([]);
	const [assignDialogOpen, setAssignDialogOpen] = useState(false);
	const [pendingAssign, setPendingAssign] = useState<OrgUserListItem[]>([]);
	const [manageRolesOpen, setManageRolesOpen] = useState(false);
	const [userForRoles, setUserForRoles] = useState<OrgUserListItem | null>(
		null,
	);
	const [addUserOpen, setAddUserOpen] = useState(false);
	const [tempPasswordInfo, setTempPasswordInfo] = useState<{
		email: string;
		password: string;
	} | null>(null);
	const [showTempPasswordDialog, setShowTempPasswordDialog] = useState(false);
	const [revealTempPassword, setRevealTempPassword] = useState(false);

	const onboardUserMutation = useOnboardUser();

	const preferencesConfig = useMemo<DataTablePreferencesConfig>(
		() => ({
			id: "org-users-list",
			scope: "user",
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
		}),
		[user?.id, user?.org_id],
	);
	const persistedPreferences = useMemo(
		() => loadDataTablePreferences(preferencesConfig),
		[preferencesConfig],
	);
	const preferredPageSize =
		typeof persistedPreferences?.pagination?.pageSize === "number"
			? persistedPreferences.pagination.pageSize
			: DEFAULT_PAGE_SIZE;

	const initialColumnVisibility = useMemo<VisibilityState>(
		() => ({
			preferredName: false,
			phoneNumber: false,
			timezone: false,
			departmentId: false,
			department: false,
			invitedAt: false,
			acceptedAt: false,
			membershipCreatedAt: false,
			userCreatedAt: false,
			employmentStartDate: false,
			invitationStatus: false,
			roles: false,
			countryCode: false,
			stateCode: false,
			addressLine1: false,
			addressLine2: false,
			postalCode: false,
			firstName: false,
			middleName: false,
			lastName: false,
			isActive: false,
			isSuperuser: false,
			userId: false,
			membershipId: false,
			orgId: false,
			orgName: false,
		}),
		[],
	);

	const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
	const pageSize = parsePositiveInt(
		searchParams.get("page_size"),
		preferredPageSize,
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
		[page, pageSize],
	);

	const { data, isLoading, isError, error, refetch } =
		useOrgUsersList(listParams);

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
		[page, pageSize],
	);

	const handlePaginationChange = (
		updater: PaginationState | ((previous: PaginationState) => PaginationState),
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

	const openAssignDialog = (selectedRows: OrgUserListItem[]) => {
		if (selectedRows.length === 0) return;
		setPendingAssign(selectedRows);
		setAssignDialogOpen(true);
	};

	const handleDeleteDialogChange = (open: boolean) => {
		setDeleteDialogOpen(open);
		if (!open) {
			setPendingDelete([]);
		}
	};

	const handleAssignDialogChange = (open: boolean) => {
		setAssignDialogOpen(open);
		if (!open) {
			setPendingAssign([]);
		}
	};

	const openManageRoles = (user: OrgUserListItem) => {
		setUserForRoles(user);
		setManageRolesOpen(true);
	};

	const handleConfirmDelete = () => {
		if (!pendingDelete.length) return;
		const membershipIds = Array.from(
			new Set(pendingDelete.map((row) => row.membership.id)),
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

	const renderToolbarActions = (selectedRows: OrgUserListItem[]) => {
		const canManageRoles =
			can("role.manage") &&
			can("user.manage") &&
			selectedRows.length === 1 &&
			selectedRows[0].membership.employment_status?.toUpperCase() ===
				"ACTIVE" &&
			selectedRows[0].membership.platform_status?.toUpperCase() === "ACTIVE";

		const canAssignDepartment = can("department.manage") && can("user.manage");
		const canDeleteUsers = can("user.manage");

		return (
			<div className="flex items-center gap-2">
				{canManageRoles && (
					<ToolbarButton
						variant="outline"
						size="sm"
						onClick={() => openManageRoles(selectedRows[0])}
					>
						Manage roles
					</ToolbarButton>
				)}
				{canAssignDepartment && (
					<ToolbarButton
						variant="outline"
						size="sm"
						onClick={() => openAssignDialog(selectedRows)}
					>
						Assign department
					</ToolbarButton>
				)}
				{canDeleteUsers && (
					<ToolbarButton
						variant="destructive"
						size="sm"
						disabled={isDeleting}
						onClick={() => openDeleteDialog(selectedRows)}
					>
						{selectedRows.length === 1 ? "Delete user" : "Delete users"}
					</ToolbarButton>
				)}
			</div>
		);
	};

	const pendingDeleteCount = pendingDelete.length;
	const pendingDeleteLabel =
		pendingDeleteCount === 1
			? getDisplayName(pendingDelete[0].user)
			: `${pendingDeleteCount} users`;

	const handleAddUser = async (values: OnboardUserPayload) => {
		const result = await onboardUserMutation.mutateAsync(values);
		if (result?.temporary_password) {
			setTempPasswordInfo({
				email: result.user?.email ?? values.email,
				password: result.temporary_password,
			});
			setRevealTempPassword(false);
			setShowTempPasswordDialog(true);
		}
	};

	const handleCopyTempPassword = async () => {
		if (!tempPasswordInfo?.password) return;
		try {
			await navigator.clipboard.writeText(tempPasswordInfo.password);
			toast({
				title: "Temporary password copied",
				description: "Share this with the user so they can sign in.",
			});
		} catch {
			toast({
				variant: "destructive",
				title: "Copy failed",
				description: "Unable to copy. Please copy the password manually.",
			});
		}
	};

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Org users"
				subtitle="View organization users and core statuses."
				actions={
					can("user.onboard") ? (
						<Button asChild variant="outline" size="sm">
							<Link to={routes.peopleUsersOnboard}>Bulk user onboarding</Link>
						</Button>
					) : null
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
					initialColumnVisibility={initialColumnVisibility}
					className="flex-1 min-h-0"
					onRowClick={(row) =>
						navigate(
							routes.peopleUserDetail.replace(
								":membershipId",
								row.membership.id,
							),
						)
					}
					headerActions={
						can("user.onboard")
							? {
									primaryAction: {
										label: "Add user",
										onClick: () => setAddUserOpen(true),
									},
								}
							: undefined
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
			{can("user.onboard") ? (
				<AddUserDialog
					open={addUserOpen}
					onOpenChange={setAddUserOpen}
					onSubmit={handleAddUser}
				/>
			) : null}
			<AssignDepartmentDialog
				open={assignDialogOpen}
				onOpenChange={handleAssignDialogChange}
				membershipIds={pendingAssign.map((row) => row.membership.id)}
				onSuccess={() => {
					// Optionally clear selection or refetch
					// The mutation hook already invalidates userKeys.list()
				}}
			/>
			<ManageRolesDialog
				key={userForRoles?.membership.id}
				open={manageRolesOpen}
				onOpenChange={setManageRolesOpen}
				user={userForRoles}
			/>
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
			<Dialog
				open={showTempPasswordDialog}
				onOpenChange={(open) => {
					setShowTempPasswordDialog(open);
					if (!open) {
						setTempPasswordInfo(null);
						setRevealTempPassword(false);
					}
				}}
			>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>Temporary password created</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<p className="text-sm text-muted-foreground">
							Share this temporary password with{" "}
							<span className="font-semibold text-foreground">
								{tempPasswordInfo?.email ?? "the user"}
							</span>
							. They will be asked to change it on first login.
						</p>
						<div className="mt-4 space-y-2">
							<label className="text-xs font-semibold text-muted-foreground">
								Temporary password
							</label>
							<div className="relative">
								<Input
									readOnly
									type={revealTempPassword ? "text" : "password"}
									value={tempPasswordInfo?.password ?? ""}
									className="pr-11"
								/>
								<Button
									type="button"
									variant="ghost"
									size="icon"
									className="absolute right-1 top-1/2 h-9 w-9 -translate-y-1/2"
									onClick={() => setRevealTempPassword((prev) => !prev)}
									aria-label={
										revealTempPassword
											? "Hide temporary password"
											: "Show temporary password"
									}
									disabled={!tempPasswordInfo?.password}
								>
									{revealTempPassword ? (
										<EyeOff className="h-4 w-4" />
									) : (
										<Eye className="h-4 w-4" />
									)}
								</Button>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={handleCopyTempPassword}
								disabled={!tempPasswordInfo?.password}
							>
								Copy password
							</Button>
						</div>
					</DialogBody>
					<DialogFooter>
						<Button
							type="button"
							onClick={() => setShowTempPasswordDialog(false)}
						>
							Done
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
