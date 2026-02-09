import { useEffect, useMemo, useState } from "react";
import type { PaginationState, VisibilityState } from "@tanstack/react-table";
import { AlertTriangle, Users } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { Skeleton } from "@/shared/ui/Skeleton";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { Button } from "@/shared/ui/Button";
import { useToast } from "@/shared/ui/use-toast";
import { ToolbarButton } from "@/shared/ui/toolbar";
import { useAuth } from "@/auth/hooks";
import { Checkbox } from "@/shared/ui/checkbox";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { usePermissions } from "@/auth/hooks";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { formatDate } from "@/shared/lib/format";
import { loadDataTablePreferences } from "@/shared/ui/Table/constants";
import { listDepartmentMembers } from "@/entities/department/api";
import {
	useArchiveDepartment,
	useCreateDepartment,
	useDepartmentsList,
	useUpdateDepartment,
} from "@/entities/department/hooks";
import { DepartmentFormDialog } from "@/entities/department/components/DepartmentFormDialog";
import type {
	Department,
	DepartmentFormMode,
	DepartmentMember,
	DepartmentListParams,
} from "@/entities/department/types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function parsePositiveInt(value: string | null, fallback: number) {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed) || parsed <= 0) return fallback;
	return parsed;
}

export function DepartmentsPage() {
	const { user } = useAuth();
	const preferencesConfig = useMemo(
		() => ({
			id: "departments-list",
			scope: "user" as const,
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
	const [searchParams, setSearchParams] = useSearchParams();
	const [includeArchived, setIncludeArchived] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<DepartmentFormMode>("create");
	const [editing, setEditing] = useState<Department | null>(null);
	const [confirming, setConfirming] = useState<Department | null>(null);
	const [membersOpen, setMembersOpen] = useState(false);
	const [memberDept, setMemberDept] = useState<Department | null>(null);
	const [members, setMembers] = useState<DepartmentMember[]>([]);
	const [membersLoading, setMembersLoading] = useState(false);
	const { can } = usePermissions();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();

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

	const listParams = useMemo<DepartmentListParams>(
		() => ({
			page,
			page_size: pageSize,
			include_archived: includeArchived,
		}),
		[includeArchived, page, pageSize],
	);

	const { data, isLoading, isError, refetch } = useDepartmentsList(listParams);

	const canManage = can("department.manage");

	const createMutation = useCreateDepartment({
		onSuccess: () => {
			toast({ title: "Department created" });
			setFormOpen(false);
			const nextParams = new URLSearchParams(searchParams);
			nextParams.set("page", "1");
			setSearchParams(nextParams);
			refetch();
		},
		onError: (err) => apiErrorToast(err, "Unable to create department."),
	});

	const updateMutation = useUpdateDepartment({
		onSuccess: () => {
			toast({ title: "Department updated" });
			setFormOpen(false);
			setEditing(null);
		},
		onError: (err) => apiErrorToast(err, "Unable to update department."),
	});

	const archiveMutation = useArchiveDepartment({
		onSuccess: () => {
			toast({ title: "Department archived" });
			setConfirming(null);
		},
		onError: (err) => apiErrorToast(err, "Unable to archive department."),
	});

	const departments = useMemo(() => data?.items ?? [], [data?.items]);
	const total = data?.total ?? 0;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));

	useEffect(() => {
		if (page <= totalPages) return;
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("page", String(totalPages));
		setSearchParams(nextParams, { replace: true });
	}, [page, searchParams, setSearchParams, totalPages]);

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

	const openCreate = () => {
		setFormMode("create");
		setEditing(null);
		setFormOpen(true);
	};

	const openEdit = (dept: Department) => {
		setFormMode("edit");
		setEditing(dept);
		setFormOpen(true);
	};

	const openMembers = async (dept: Department) => {
		setMemberDept(dept);
		setMembersOpen(true);
		setMembers([]);
		setMembersLoading(true);
		try {
			const result = await listDepartmentMembers(dept.id, {
				page: 1,
				page_size: 100,
			});
			setMembers(result.items ?? []);
		} catch (err) {
			apiErrorToast(err, "Unable to load department members.");
		} finally {
			setMembersLoading(false);
		}
	};

	const handleSubmit = async (
		values: { name: string; code: string },
		id?: string,
	) => {
		if (formMode === "edit" && id) {
			await updateMutation.mutateAsync({ id, payload: values });
		} else {
			await createMutation.mutateAsync(values);
		}
	};

	const columns = useMemo<ColumnDefinition<Department>[]>(
		() => [
			{
				id: "id",
				header: "ID",
				accessor: (dept) => dept.id,
				cell: (dept) => dept.id,
				enableSorting: false,
				enableFiltering: false,
			},
			{
				id: "orgId",
				header: "Org ID",
				accessor: (dept) => dept.org_id,
				cell: (dept) => dept.org_id,
				enableSorting: false,
				enableFiltering: false,
			},
			{
				id: "name",
				header: "Name",
				accessor: (dept) => dept.name,
				filterAccessor: (dept) => dept.name,
				cell: (dept) => dept.name,
				headerClassName: "min-w-[180px]",
				cellClassName: "font-medium",
			},
			{
				id: "code",
				header: "Code",
				accessor: (dept) => dept.code,
				filterAccessor: (dept) => dept.code,
				cell: (dept) => dept.code || "—",
				cellClassName: "text-muted-foreground",
			},
			{
				id: "members",
				header: "Members",
				accessor: (dept) => dept.member_count ?? 0,
				cell: (dept) =>
					typeof dept.member_count === "number" ? dept.member_count : "—",
				cellClassName: "text-muted-foreground",
			},
			{
				id: "status",
				header: "Status",
				accessor: (dept) => (dept.is_archived ? "Archived" : "Active"),
				filterAccessor: (dept) => (dept.is_archived ? "Archived" : "Active"),
				cell: (dept) => (
					<span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium">
						{dept.is_archived ? "Archived" : "Active"}
					</span>
				),
			},
			{
				id: "createdAt",
				header: "Created",
				accessor: (dept) => dept.created_at ?? "",
				cell: (dept) => formatDate(dept.created_at),
			},
			{
				id: "updatedAt",
				header: "Updated",
				accessor: (dept) => dept.updated_at ?? "",
				cell: (dept) => formatDate(dept.updated_at),
			},
		],
		[],
	);

	const initialColumnVisibility = useMemo<VisibilityState>(
		() => ({
			id: false,
			orgId: false,
		}),
		[],
	);
	const handleToggleArchived = () => {
		const nextValue = !includeArchived;
		setIncludeArchived(nextValue);
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("page", "1");
		setSearchParams(nextParams);
	};

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Departments"
				subtitle="Manage organization departments."
			/>

			{isError ? (
				<div className="rounded-xl border border-border/70 bg-card">
					<div className="p-6">
						<p className="text-sm text-muted-foreground">
							Unable to load departments. Please try again.
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
					data={departments}
					columns={columns}
					getRowId={(dept) => dept.id}
					isLoading={isLoading}
					enableRowSelection
					enableExport={true}
					pagination={{
						enabled: true,
						mode: "server",
						state: paginationState,
						onPaginationChange: handlePaginationChange,
						pageCount: totalPages,
						totalRows: total,
					}}
					preferences={preferencesConfig}
					initialColumnVisibility={initialColumnVisibility}
					className="flex-1 min-h-0"
					onRowClick={(dept) => {
						void openMembers(dept);
					}}
					emptyMessage="No departments yet. Create a department to organize your org."
					renderToolbarActions={(selectedDepartments) => {
						const hasSingle = selectedDepartments.length === 1;
						const selectedDept = hasSingle ? selectedDepartments[0] : null;
						return (
							<>
								<ToolbarButton
									variant="outline"
									size="sm"
									disabled={!hasSingle}
									onClick={() => {
										if (selectedDept) {
											void openMembers(selectedDept);
										}
									}}
								>
									View members
								</ToolbarButton>
								{canManage ? (
									<>
										<ToolbarButton
											variant="outline"
											size="sm"
											disabled={!hasSingle}
											onClick={() => {
												if (selectedDept) {
													openEdit(selectedDept);
												}
											}}
										>
											Edit
										</ToolbarButton>
										<ToolbarButton
											variant="destructive"
											size="sm"
											disabled={
												!hasSingle || Boolean(selectedDept?.is_archived)
											}
											onClick={() => {
												if (selectedDept) {
													setConfirming(selectedDept);
												}
											}}
										>
											Archive
										</ToolbarButton>
									</>
								) : null}
							</>
						);
					}}
					headerActions={{
						primaryAction: canManage
							? {
									label: "New department",
									onClick: openCreate,
								}
							: undefined,
					}}
					headerFilters={
						<label className="flex items-center gap-2 text-xs text-muted-foreground">
							<Checkbox
								checked={includeArchived}
								onCheckedChange={() => handleToggleArchived()}
							/>
							Show archived
						</label>
					}
				/>
			)}

			<DepartmentFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				mode={formMode}
				initialDepartment={editing}
				onSubmit={handleSubmit}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			/>

			<ConfirmationDialog
				open={Boolean(confirming)}
				onOpenChange={() => setConfirming(null)}
				title="Archive department?"
				description={`Archiving ${
					confirming?.name ?? "this department"
				} will remove it from selection for new assignments.`}
				confirmLabel="Archive"
				onConfirm={() =>
					confirming ? archiveMutation.mutate(confirming.id) : undefined
				}
				loading={archiveMutation.isPending}
			/>

			<Dialog open={membersOpen} onOpenChange={setMembersOpen}>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Users className="h-4 w-4" />
							Department members
						</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<p className="mb-2 text-sm text-muted-foreground">
							{memberDept?.name ?? "Department"}
						</p>
						{membersLoading ? (
							<div className="space-y-2">
								{Array.from({ length: 3 }).map((_, index) => (
									<div
										key={`department-members-skeleton-${index}`}
										className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-3 py-2"
									>
										<div className="space-y-1">
											<Skeleton className="h-4 w-36" />
											<Skeleton className="h-3 w-44" />
										</div>
										<Skeleton className="h-3 w-16" />
									</div>
								))}
							</div>
						) : members.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No members are assigned to this department.
							</p>
						) : (
							<ul className="space-y-2">
								{members.map((member) => {
									const name =
										member.user.full_name ||
										[member.user.first_name, member.user.last_name]
											.filter(Boolean)
											.join(" ")
											.trim() ||
										member.user.email;
									return (
										<li
											key={member.membership.id}
											className="flex items-center justify-between rounded-md border border-border/70 bg-muted/20 px-3 py-2 text-sm"
										>
											<div className="space-y-0.5">
												<p className="font-semibold text-foreground">{name}</p>
												<p className="text-xs text-muted-foreground">
													{member.user.email}
												</p>
											</div>
											<span className="text-xs text-muted-foreground">
												{member.membership.employment_status}
											</span>
										</li>
									);
								})}
							</ul>
						)}
					</DialogBody>
					<DialogFooter>
						<Button variant="outline" onClick={() => setMembersOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}

function ConfirmationDialog({
	open,
	onOpenChange,
	title,
	description,
	confirmLabel,
	onConfirm,
	loading,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description: string;
	confirmLabel: string;
	onConfirm: () => void;
	loading?: boolean;
}) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent size="sm">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="h-4 w-4 text-amber-500" />
						{title}
					</DialogTitle>
				</DialogHeader>
				<DialogBody>
					<p className="text-sm text-muted-foreground">{description}</p>
				</DialogBody>
				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
					<Button variant="destructive" onClick={onConfirm} disabled={loading}>
						{loading ? "Archiving..." : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
