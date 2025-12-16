import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusCircle, RefreshCw, AlertTriangle, Users } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Pagination } from "@/components/ui/pagination";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { queryKeys } from "@/lib/queryKeys";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import {
	archiveDepartment,
	createDepartment,
	listDepartments,
	updateDepartment,
} from "../api/departments.api";
import { DepartmentFormDialog } from "../components/DepartmentFormDialog";
import { DepartmentTable } from "../components/DepartmentTable";
import type { Department, DepartmentFormMode } from "../types";
import { listDepartmentMembers } from "../api/departments.api";
import type { DepartmentMember } from "../types";

export function DepartmentsPage() {
	const [page, setPage] = useState(1);
	const pageSize = 10;
	const [includeArchived, setIncludeArchived] = useState(false);
	const [formOpen, setFormOpen] = useState(false);
	const [formMode, setFormMode] = useState<DepartmentFormMode>("create");
	const [editing, setEditing] = useState<Department | null>(null);
	const [confirming, setConfirming] = useState<Department | null>(null);
	const [sortKey, setSortKey] = useState<"name" | "code" | "created_at">("name");
	const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
	const [membersOpen, setMembersOpen] = useState(false);
	const [memberDept, setMemberDept] = useState<Department | null>(null);
	const [members, setMembers] = useState<DepartmentMember[]>([]);
	const [membersLoading, setMembersLoading] = useState(false);
	const { can } = usePermissions();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const queryClient = useQueryClient();

	const { data, isLoading, isError, refetch, isFetching } = useQuery({
		queryKey: queryKeys.departments.list({
			page,
			page_size: pageSize,
			include_archived: includeArchived,
		}),
		queryFn: () =>
			listDepartments({
				page,
				page_size: pageSize,
				include_archived: includeArchived,
			}),
		placeholderData: (prev) => prev,
	});

	const canManage = can("department.manage");

	const createMutation = useMutation({
		mutationFn: (values: { name: string; code: string }) =>
			createDepartment(values),
		onSuccess: () => {
			toast({ title: "Department created" });
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) &&
					query.queryKey[0] === "departments" &&
					query.queryKey[1] === "list",
			});
			setFormOpen(false);
		},
		onError: (err) => apiErrorToast(err, "Unable to create department."),
	});

	const updateMutation = useMutation({
		mutationFn: ({ id, values }: { id: string; values: { name: string; code: string } }) =>
			updateDepartment(id, values),
		onSuccess: () => {
			toast({ title: "Department updated" });
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) &&
					query.queryKey[0] === "departments" &&
					query.queryKey[1] === "list",
			});
			setFormOpen(false);
			setEditing(null);
		},
		onError: (err) => apiErrorToast(err, "Unable to update department."),
	});

	const archiveMutation = useMutation({
		mutationFn: (deptId: string) => archiveDepartment(deptId),
		onSuccess: () => {
			toast({ title: "Department archived" });
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) &&
					query.queryKey[0] === "departments" &&
					query.queryKey[1] === "list",
			});
			setConfirming(null);
		},
		onError: (err) => apiErrorToast(err, "Unable to archive department."),
	});

	const departments = useMemo(() => data?.items ?? [], [data?.items]);
	const sortedDepartments = useMemo(() => {
		const copy = [...departments];
		copy.sort((a, b) => {
			const aVal = (a[sortKey] || "") as string;
			const bVal = (b[sortKey] || "") as string;
			if (aVal === bVal) return 0;
			if (sortDir === "asc") {
				return aVal > bVal ? 1 : -1;
			}
			return aVal < bVal ? 1 : -1;
		});
		return copy;
	}, [departments, sortDir, sortKey]);
	const total = data?.total ?? 0;
	const hasNext = page * pageSize < total;

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
			await updateMutation.mutateAsync({ id, values });
		} else {
			await createMutation.mutateAsync(values);
		}
	};

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Departments"
				subtitle="Manage organization departments."
				actions={
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => refetch()}
							disabled={isFetching}
						>
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh
						</Button>
						{canManage ? (
							<Button size="sm" onClick={openCreate}>
								<PlusCircle className="mr-2 h-4 w-4" />
								New department
							</Button>
						) : null}
					</div>
				}
			/>

			<div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
				<label className="inline-flex items-center gap-2">
					<input
						type="checkbox"
						checked={includeArchived}
						onChange={(e) => setIncludeArchived(e.target.checked)}
						className="h-4 w-4"
					/>
					Show archived
				</label>
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">Sort by</span>
						<Select
							value={`${sortKey}:${sortDir}`}
							onValueChange={(val) => {
								const [key, dir] = val.split(":") as [
									"name" | "code" | "created_at",
									"asc" | "desc",
								];
								setSortKey(key);
								setSortDir(dir);
							}}
						>
							<SelectTrigger className="h-8 w-40 text-xs">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="name:asc">Name (A-Z)</SelectItem>
								<SelectItem value="name:desc">Name (Z-A)</SelectItem>
								<SelectItem value="code:asc">Code (A-Z)</SelectItem>
								<SelectItem value="code:desc">Code (Z-A)</SelectItem>
								<SelectItem value="created_at:desc">Created (newest)</SelectItem>
								<SelectItem value="created_at:asc">Created (oldest)</SelectItem>
							</SelectContent>
						</Select>
					</div>
					{isFetching ? <span className="text-xs">Updating…</span> : null}
				</div>
			</div>

			<DepartmentTable
				departments={sortedDepartments}
				isLoading={isLoading}
				isError={isError}
				onRetry={refetch}
				onEdit={canManage ? openEdit : undefined}
				onArchive={canManage ? (dept) => setConfirming(dept) : undefined}
				canManage={canManage}
				onViewMembers={openMembers}
			/>

			<Pagination
				page={page}
				pageSize={pageSize}
				total={total}
				hasNext={hasNext}
				isLoading={isFetching}
				onPageChange={setPage}
			/>

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
				description={`Archiving ${confirming?.name ?? "this department"} will remove it from selection for new assignments.`}
				confirmLabel="Archive"
				onConfirm={() =>
					confirming ? archiveMutation.mutate(confirming.id) : undefined
				}
				loading={archiveMutation.isPending}
			/>

			<Dialog open={membersOpen} onOpenChange={setMembersOpen}>
				<DialogContent size="md">
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
							<p className="text-sm text-muted-foreground">Loading members…</p>
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
												<p className="font-semibold text-foreground">
													{name}
												</p>
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
					<Button
						variant="destructive"
						onClick={onConfirm}
						disabled={loading}
					>
						{loading ? "Archiving..." : confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
