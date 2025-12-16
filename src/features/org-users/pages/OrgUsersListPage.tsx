import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { RefreshCw, Upload, UserPlus } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Pagination } from "@/components/ui/pagination";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { AddUserDialog } from "../components/AddUserDialog";
import { OrgUsersFilters } from "../components/OrgUsersFilters";
import { OrgUsersTable } from "../components/OrgUsersTable";
import { OrgUserSidePanel } from "../components/OrgUserSidePanel";
import {
	useOrgUsersList,
	useOnboardUser,
	useBulkDeleteOrgUsers,
} from "../hooks/useOrgUsers";
import type {
	EmploymentStatus,
	OrgUsersListParams,
	OnboardUserPayload,
	PlatformStatus,
} from "../types";

export function OrgUsersListPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [employmentStatus, setEmploymentStatus] = useState<
		EmploymentStatus | "ALL"
	>("ALL");
	const [platformStatus, setPlatformStatus] = useState<PlatformStatus | "ALL">(
		"ALL"
	);
	const [roleId, setRoleId] = useState<string>("");
	const [page, setPage] = useState(1);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [selectedMembershipId, setSelectedMembershipId] = useState<
		string | null
	>(null);
	const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
	const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
	const apiErrorToast = useApiErrorToast();
	const { can } = usePermissions();
	const canManageUsers = can("user.manage");
	const canOnboardUsers = can("user.onboard");

	const onboardUserMutation = useOnboardUser();
	const bulkDeleteMutation = useBulkDeleteOrgUsers();

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const listParams = useMemo<OrgUsersListParams>(
		() => ({
			search: debouncedSearch || undefined,
			employment_status:
				employmentStatus === "ALL"
					? undefined
					: (employmentStatus?.toString().toUpperCase() as EmploymentStatus),
			platform_status:
				platformStatus === "ALL"
					? undefined
					: (platformStatus?.toString().toUpperCase() as PlatformStatus),
			role_id: roleId || undefined,
			page,
			page_size: 7,
		}),
		[debouncedSearch, employmentStatus, platformStatus, roleId, page]
	);

	const {
		data,
		isLoading,
		isFetching,
		isError,
		error: queryError,
		refetch,
	} = useOrgUsersList(listParams);

	const selectedUsers = useMemo(() => {
		if (!data?.items?.length) return [];
		return data.items.filter((item) => selectedIds.has(item.membership.id));
	}, [data, selectedIds]);

	useEffect(() => {
		if (isError) {
			apiErrorToast(
				queryError,
				"Unable to load users right now. Please try again."
			);
		}
	}, [queryError, isError, apiErrorToast]);

	const handleAddUser = async (values: OnboardUserPayload) => {
		await onboardUserMutation.mutateAsync(values);
	};

	const handleSearchChange = (value: string) => {
		setSearchTerm(value);
		setPage(1);
	};

	const handleEmploymentChange = (value: EmploymentStatus | "ALL") => {
		setEmploymentStatus(value);
		setPage(1);
	};

	const handlePlatformChange = (value: PlatformStatus | "ALL") => {
		setPlatformStatus(value);
		setPage(1);
	};

	const handleRoleChange = (value: string) => {
		setRoleId(value);
		setPage(1);
	};

	const handleSelectUser = (membershipId: string) => {
		setSelectedMembershipId(membershipId);
		setIsSidePanelOpen(true);
	};

	const handleToggleSelect = (membershipId: string, checked: boolean) => {
		if (!canManageUsers) return;
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(membershipId);
			} else {
				next.delete(membershipId);
			}
			return next;
		});
	};

	const handleToggleSelectAll = (checked: boolean, ids: string[]) => {
		if (!canManageUsers) return;
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (checked) {
				ids.forEach((id) => next.add(id));
			} else {
				ids.forEach((id) => next.delete(id));
			}
			return next;
		});
	};

	const handleClearSelection = () => setSelectedIds(new Set());

	const handleBulkDelete = async () => {
		if (!canManageUsers || selectedIds.size === 0) return;
		try {
			await bulkDeleteMutation.mutateAsync(Array.from(selectedIds));
			handleClearSelection();
		} catch {
			void 0;
		}
	};

	const total = data?.total;
	const pageSize = data?.page_size ?? listParams.page_size ?? 10;
	const hasNext =
		typeof total === "number"
			? page * pageSize < total
			: (data?.items?.length ?? 0) === pageSize;

	return (
		<PageContainer>
			<PageHeader
				title="Org users"
				subtitle="View organization users and core statuses. Data is scoped to your current organization."
				actions={
					<div className="flex flex-wrap gap-2">
						{canOnboardUsers ? (
							<AddUserDialog
								open={isAddModalOpen}
								onOpenChange={setIsAddModalOpen}
								onSubmit={handleAddUser}
								trigger={
									<Button variant="outline" size="sm">
										<UserPlus className="mr-2 h-4 w-4" />
										Add user
									</Button>
								}
							/>
						) : null}
						{canManageUsers ? (
							<Button
								variant="destructive"
								size="sm"
								disabled={selectedIds.size === 0}
								onClick={() => setConfirmDeleteOpen(true)}
							>
								Delete selected ({selectedIds.size})
							</Button>
						) : null}
						{canOnboardUsers ? (
							<Button variant="outline" size="sm" asChild>
								<Link to="/app/users/onboard">
									<Upload className="mr-2 h-4 w-4" />
									Bulk onboarding
								</Link>
							</Button>
						) : null}
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh
						</Button>
					</div>
				}
			/>

			<OrgUsersFilters
				search={searchTerm}
				onSearchChange={handleSearchChange}
				employmentStatus={employmentStatus}
				onEmploymentChange={handleEmploymentChange}
				platformStatus={platformStatus}
				onPlatformChange={handlePlatformChange}
				roleId={roleId}
				onRoleChange={handleRoleChange}
			/>
			<OrgUsersTable
				items={data?.items ?? []}
				isLoading={isLoading}
				isError={isError}
				isFetching={isFetching}
				onRefresh={() => refetch()}
				canManage={canManageUsers}
				onSelect={handleSelectUser}
				selectedIds={selectedIds}
				onToggleSelect={handleToggleSelect}
				onToggleSelectAll={handleToggleSelectAll}
			/>
			<Pagination
				page={page}
				pageSize={pageSize}
				total={total}
				hasNext={hasNext}
				isLoading={isFetching}
				onPageChange={setPage}
			/>
			<OrgUserSidePanel
				membershipId={selectedMembershipId}
				open={isSidePanelOpen}
				onOpenChange={setIsSidePanelOpen}
				onUpdated={() => refetch()}
			/>

			<Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>
							{selectedUsers.length === 1
								? `Delete ${
										[
											selectedUsers[0]?.user.first_name,
											selectedUsers[0]?.user.last_name,
										]
											.filter(Boolean)
											.join(" ")
											.trim() || "this user"
								  }?`
								: `Delete ${selectedUsers.length} users?`}
						</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<p className="text-sm text-muted-foreground">
							You are about to delete{" "}
							{selectedUsers.length === 1
								? [
										selectedUsers[0]?.user.first_name,
										selectedUsers[0]?.user.last_name,
								  ]
										.filter(Boolean)
										.join(" ")
										.trim() || "this user"
								: `${selectedUsers.length} users`}{" "}
							from the organization. This action cannot be undone or reversed.
							Please confirm your action.
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							Deleted users will lose access to the organization's resources and
							data.
						</p>
					</DialogBody>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setConfirmDeleteOpen(false)}
						>
							Cancel
						</Button>
						<Button
							variant="destructive"
							onClick={() => {
								setConfirmDeleteOpen(false);
								void handleBulkDelete();
							}}
							disabled={selectedIds.size === 0}
						>
							Confirm delete
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
