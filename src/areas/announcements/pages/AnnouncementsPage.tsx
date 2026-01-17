import { useEffect, useMemo, useState } from "react";
import type { PaginationState, VisibilityState } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { Button } from "@/shared/ui/Button";
import { ToolbarButton } from "@/shared/ui/toolbar";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { useToast } from "@/shared/ui/use-toast";
import { usePermissions } from "@/auth/hooks";
import { useAuth } from "@/auth/hooks";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { formatDate } from "@/shared/lib/format";
import { loadDataTablePreferences } from "@/shared/ui/Table/constants";
import {
	useAdminAnnouncementsList,
	useAnnouncementsList,
	useChangeAnnouncementStatus,
	useCreateAnnouncement,
	useUpdateAnnouncement,
} from "@/entities/announcement/hooks";
import { AnnouncementFormDialog } from "@/entities/announcement/components/AnnouncementFormDialog";
import {
	ANNOUNCEMENT_STATUS_LABELS,
	ANNOUNCEMENT_STATUS_TONE,
	ANNOUNCEMENT_TYPE_COLORS,
} from "@/entities/announcement/constants";
import type {
	Announcement,
	AnnouncementFormValues,
	AnnouncementStatus,
} from "@/entities/announcement/types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 10;

function parsePositiveInt(value: string | null, fallback: number) {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed) || parsed <= 0) return fallback;
	return parsed;
}

export function AnnouncementsPage() {
	const { can } = usePermissions();
	const canManage = can("announcement.manage");
	const { user } = useAuth();
	const [searchParams, setSearchParams] = useSearchParams();
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingAnnouncement, setEditingAnnouncement] =
		useState<Announcement | null>(null);
	const [statusDialog, setStatusDialog] = useState<{
		target: Announcement | null;
		nextStatus: AnnouncementStatus | null;
	}>(() => ({ target: null, nextStatus: null }));
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const preferencesConfig = useMemo(
		() => ({
			id: "announcements-admin",
			scope: "user" as const,
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
			version: 2,
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

	const listParams = useMemo(
		() => ({
			status: canManage ? undefined : ("PUBLISHED" as AnnouncementStatus),
			page,
			page_size: pageSize,
		}),
		[canManage, page, pageSize]
	);

	const adminAnnouncementsQuery = useAdminAnnouncementsList(listParams, {
		enabled: canManage,
	});
	const announcementsQuery = useAnnouncementsList(listParams, {
		enabled: !canManage,
	});
	const { data, isLoading, isError, refetch } = canManage
		? adminAnnouncementsQuery
		: announcementsQuery;

	const createMutation = useCreateAnnouncement({
		onSuccess: () => {
			toast({ title: "Announcement created" });
			setIsFormOpen(false);
		},
		onError: (error) => apiErrorToast(error, "Unable to create announcement."),
	});

	const updateMutation = useUpdateAnnouncement({
		onSuccess: () => {
			toast({ title: "Announcement updated" });
			setIsFormOpen(false);
			setEditingAnnouncement(null);
		},
		onError: (error) => apiErrorToast(error, "Unable to update announcement."),
	});

	const statusMutation = useChangeAnnouncementStatus({
		onSuccess: () => {
			toast({ title: "Status updated" });
			setStatusDialog({ target: null, nextStatus: null });
		},
		onError: (error) => apiErrorToast(error, "Unable to change status."),
	});

	const handleSave = async (values: AnnouncementFormValues) => {
		if (editingAnnouncement) {
			await updateMutation.mutateAsync({
				id: editingAnnouncement.id,
				payload: {
					title: values.title,
					body: values.body,
					scheduled_at: values.scheduled_at || null,
					status: values.status || editingAnnouncement.status,
					type: values.type,
				},
			});
		} else {
			await createMutation.mutateAsync({
				title: values.title,
				body: values.body,
				scheduled_at: values.scheduled_at || null,
				status: values.status || "DRAFT",
				type: values.type,
			});
		}
	};

	const openCreate = () => {
		setEditingAnnouncement(null);
		setIsFormOpen(true);
	};

	const openEdit = (announcement: Announcement) => {
		setEditingAnnouncement(announcement);
		setIsFormOpen(true);
	};

	const requestStatusChange = (
		announcement: Announcement,
		nextStatus: AnnouncementStatus
	) => {
		setStatusDialog({ target: announcement, nextStatus });
	};

	const confirmStatusChange = () => {
		if (!statusDialog.target || !statusDialog.nextStatus) return;
		statusMutation.mutate({
			id: statusDialog.target.id,
			status: statusDialog.nextStatus,
		});
	};

	const announcements = useMemo(() => data?.items ?? [], [data?.items]);
	const totalRows = data?.total ?? announcements.length;
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

	const columns = useMemo<ColumnDefinition<Announcement>[]>(
		() => [
			{
				id: "id",
				header: "ID",
				accessor: (item) => item.id,
				cell: (item) => item.id,
				enableSorting: false,
				enableFiltering: false,
			},
			{
				id: "orgId",
				header: "Org ID",
				accessor: (item) => item.org_id ?? "",
				cell: (item) => item.org_id ?? "—",
				enableSorting: false,
				enableFiltering: false,
			},
			{
				id: "title",
				header: "Title",
				accessor: (item) => item.title,
				filterAccessor: (item) => `${item.title} ${item.body}`.trim(),
				cell: (item) => (
					<div className="flex flex-col gap-1">
						<span className="font-medium text-foreground">{item.title}</span>
					</div>
				),
				headerClassName: "min-w-[240px]",
			},
			{
				id: "status",
				header: "Status",
				accessor: (item) => item.status,
				filterAccessor: (item) => `${item.status} ${item.type ?? ""}`.trim(),
				cell: (item) => (
					<div className="flex flex-col gap-1">
						<span
							className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
								ANNOUNCEMENT_STATUS_TONE[item.status]
							}`}
						>
							{ANNOUNCEMENT_STATUS_LABELS[item.status]}
						</span>
					</div>
				),
			},
			{
				id: "type",
				header: "Type",
				accessor: (item) => item.type ?? "",
				cell: (item) =>
					item.type ? (
						<span
							className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${
								ANNOUNCEMENT_TYPE_COLORS[item.type] ??
								"border-border bg-muted/40 text-muted-foreground"
							}`}
						>
							{item.type.charAt(0) + item.type.slice(1).toLowerCase()}
						</span>
					) : (
						"—"
					),
			},
			{
				id: "body",
				header: "Body",
				accessor: (item) => item.body,
				filterAccessor: (item) => item.body,
				cell: (item) => item.body,
				headerClassName: "min-w-[240px]",
				cellClassName: "text-xs text-muted-foreground line-clamp-2",
			},
			{
				id: "createdAt",
				header: "Created",
				accessor: (item) => item.created_at ?? "",
				cell: (item) => formatDate(item.created_at),
			},
			{
				id: "publishedAt",
				header: "Published",
				accessor: (item) => item.published_at ?? "",
				cell: (item) =>
					item.published_at ? formatDate(item.published_at) : "—",
			},
			{
				id: "scheduledAt",
				header: "Scheduled",
				accessor: (item) => item.scheduled_at ?? "",
				cell: (item) =>
					item.scheduled_at ? formatDate(item.scheduled_at) : "—",
			},
			{
				id: "updatedAt",
				header: "Updated",
				accessor: (item) => item.updated_at ?? "",
				cell: (item) => formatDate(item.updated_at),
			},
			{
				id: "reads",
				header: "Reads",
				accessor: (item) => item.read_count ?? 0,
				cell: (item) =>
					typeof item.read_count === "number" &&
					typeof item.target_count === "number"
						? `${item.read_count} / ${item.target_count}`
						: "—",
				enableSorting: false,
				enableFiltering: false,
			},
		],
		[]
	);

	const initialColumnVisibility = useMemo<VisibilityState>(
		() => ({
			id: false,
			orgId: false,
			body: false,
			updatedAt: false,
		}),
		[]
	);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Announcements"
				subtitle="Create and manage organization-wide announcements."
			/>

			{isError ? (
				<div className="rounded-xl border border-border/70 bg-card">
					<div className="p-6">
						<p className="text-sm text-muted-foreground">
							There was a problem fetching announcements. Please retry.
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
					data={announcements}
					columns={columns}
					getRowId={(item) => item.id}
					isLoading={isLoading}
					enableRowSelection={canManage}
					enableExport={false}
					className="flex-1 min-h-0"
					pagination={{
						enabled: true,
						mode: "server",
						state: paginationState,
						onPaginationChange: handlePaginationChange,
						pageCount: totalPages,
						totalRows,
					}}
					emptyMessage={
						canManage
							? "Create your first announcement to share updates with your organization."
							: "No announcements available."
					}
					initialColumnVisibility={initialColumnVisibility}
					preferences={preferencesConfig}
					renderToolbarActions={(selectedAnnouncements) => {
						if (!canManage) return null;
						const hasSingle = selectedAnnouncements.length === 1;
						const selected = hasSingle ? selectedAnnouncements[0] : null;
						const canPublish =
							selected?.status === "DRAFT" ||
							selected?.status === "UNPUBLISHED";
						const canUnpublish = selected?.status === "PUBLISHED";
						return (
							<>
								<ToolbarButton
									variant="outline"
									size="sm"
									disabled={!hasSingle}
									onClick={() => {
										if (selected) {
											openEdit(selected);
										}
									}}
								>
									Edit
								</ToolbarButton>
								<ToolbarButton
									variant="default"
									size="sm"
									disabled={
										!hasSingle || !canPublish || statusMutation.isPending
									}
									onClick={() => {
										if (selected) {
											requestStatusChange(selected, "PUBLISHED");
										}
									}}
								>
									Publish
								</ToolbarButton>
								<ToolbarButton
									variant="outline"
									size="sm"
									disabled={
										!hasSingle || !canUnpublish || statusMutation.isPending
									}
									onClick={() => {
										if (selected) {
											requestStatusChange(selected, "UNPUBLISHED");
										}
									}}
								>
									Unpublish
								</ToolbarButton>
								<ToolbarButton
									variant="destructive"
									size="sm"
									disabled={
										!hasSingle ||
										selected?.status === "ARCHIVED" ||
										statusMutation.isPending
									}
									onClick={() => {
										if (selected) {
											requestStatusChange(selected, "ARCHIVED");
										}
									}}
								>
									Archive
								</ToolbarButton>
							</>
						);
					}}
					headerActions={
						canManage
							? {
									primaryAction: {
										label: "New announcement",
										onClick: openCreate,
										icon: Plus,
									},
							  }
							: undefined
					}
				/>
			)}

			<AnnouncementFormDialog
				open={isFormOpen}
				onOpenChange={setIsFormOpen}
				initialData={editingAnnouncement}
				onSubmit={handleSave}
				isSubmitting={createMutation.isPending || updateMutation.isPending}
			/>

			<Dialog
				open={Boolean(statusDialog.target && statusDialog.nextStatus)}
				onOpenChange={(open) => {
					if (!open) setStatusDialog({ target: null, nextStatus: null });
				}}
			>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>Change status</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<p className="text-sm text-muted-foreground">
							Change status of{" "}
							<span className="font-semibold text-foreground">
								{statusDialog.target?.title}
							</span>{" "}
							to{" "}
							{statusDialog.nextStatus
								? ANNOUNCEMENT_STATUS_LABELS[statusDialog.nextStatus]
								: ""}
							?
						</p>
					</DialogBody>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() =>
								setStatusDialog({ target: null, nextStatus: null })
							}
							disabled={statusMutation.isPending}
						>
							Cancel
						</Button>
						<Button
							variant={
								statusDialog.nextStatus === "ARCHIVED"
									? "destructive"
									: "default"
							}
							onClick={confirmStatusChange}
							disabled={statusMutation.isPending}
						>
							{statusMutation.isPending ? "Updating..." : "Confirm"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
