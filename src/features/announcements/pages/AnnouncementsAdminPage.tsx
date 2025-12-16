import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, RefreshCw } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { AnnouncementsTable } from "../components/AnnouncementsTable";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { queryKeys } from "@/lib/queryKeys";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import {
	changeAnnouncementStatus,
	createAnnouncement,
	listAnnouncements,
	updateAnnouncement,
} from "../api/announcements.api";
import { AnnouncementFormDialog } from "../components/AnnouncementFormDialog";
import {
	ANNOUNCEMENT_STATUS_LABELS,
	ANNOUNCEMENT_STATUSES,
} from "../constants";
import type {
	Announcement,
	AnnouncementFormValues,
	AnnouncementStatus,
} from "../types";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";

export function AnnouncementsAdminPage() {
	const { can } = usePermissions();
	const canManage = can("announcement.manage");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editingAnnouncement, setEditingAnnouncement] =
		useState<Announcement | null>(null);
	const [statusFilter, setStatusFilter] = useState<AnnouncementStatus | "ALL">(
		canManage ? "ALL" : "PUBLISHED"
	);
	const [statusDialog, setStatusDialog] = useState<{
		target: Announcement | null;
		nextStatus: AnnouncementStatus | null;
	}>(() => ({ target: null, nextStatus: null }));
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();

	const listParams = useMemo(
		() => ({
			status: !canManage
				? "PUBLISHED"
				: statusFilter === "ALL"
				? undefined
				: statusFilter,
			page: 1,
			page_size: 50,
		}),
		[canManage, statusFilter]
	);

	const { data, isLoading, isError, refetch, isFetching } = useQuery({
		queryKey: queryKeys.announcements.list(listParams),
		queryFn: () => listAnnouncements(listParams),
	});

	const createMutation = useMutation({
		mutationFn: (payload: AnnouncementFormValues) =>
			createAnnouncement({
				title: payload.title,
				body: payload.body,
				scheduled_at: payload.scheduled_at || null,
				status: payload.status || "DRAFT",
				type: payload.type,
			}),
		onSuccess: () => {
			toast({ title: "Announcement created" });
			queryClient.invalidateQueries({ queryKey: ["announcements"] });
			setIsFormOpen(false);
		},
		onError: (error) => apiErrorToast(error, "Unable to create announcement."),
	});

	const updateMutation = useMutation({
		mutationFn: ({
			id,
			values,
			status,
		}: {
			id: string;
			values: AnnouncementFormValues;
			status: AnnouncementStatus;
		}) =>
			updateAnnouncement(id, {
				title: values.title,
				body: values.body,
				scheduled_at: values.scheduled_at || null,
				status: values.status || status,
				type: values.type,
			}),
		onSuccess: () => {
			toast({ title: "Announcement updated" });
			queryClient.invalidateQueries({ queryKey: ["announcements"] });
			setIsFormOpen(false);
			setEditingAnnouncement(null);
		},
		onError: (error) => apiErrorToast(error, "Unable to update announcement."),
	});

	const statusMutation = useMutation({
		mutationFn: ({ id, status }: { id: string; status: AnnouncementStatus }) =>
			changeAnnouncementStatus(id, status),
		onSuccess: () => {
			toast({ title: "Status updated" });
			queryClient.invalidateQueries({ queryKey: ["announcements"] });
			setStatusDialog({ target: null, nextStatus: null });
		},
		onError: (error) => apiErrorToast(error, "Unable to change status."),
	});

	const handleSave = async (values: AnnouncementFormValues) => {
		if (editingAnnouncement) {
			await updateMutation.mutateAsync({
				id: editingAnnouncement.id,
				values,
				status: editingAnnouncement.status,
			});
		} else {
			await createMutation.mutateAsync(values);
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

	const announcements = data?.items ?? [];

	return (
		<PageContainer>
			<PageHeader
				title="Announcements"
				subtitle="Create and manage organization-wide announcements."
				actions={
					<div className="flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh
						</Button>
						{canManage ? (
							<Button size="sm" onClick={openCreate}>
								<Plus className="mr-2 h-4 w-4" />
								New announcement
							</Button>
						) : null}
					</div>
				}
			/>

			<div className="mb-4 flex flex-wrap items-center gap-3">
				<Select
					value={statusFilter}
					disabled={!canManage}
					onValueChange={(value) =>
						setStatusFilter(
							value === "ALL" ? "ALL" : (value as AnnouncementStatus)
						)
					}
				>
					<SelectTrigger className="w-[200px]">
						<SelectValue placeholder="Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All statuses</SelectItem>
						{ANNOUNCEMENT_STATUSES.map((status) => (
							<SelectItem key={status} value={status}>
								{ANNOUNCEMENT_STATUS_LABELS[status]}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{isLoading ? (
				<LoadingState label="Loading announcements..." />
			) : isError ? (
				<EmptyState
					title="Unable to load announcements"
					message="There was a problem fetching announcements. Please retry."
					actionLabel="Retry"
					onRetry={refetch}
				/>
			) : announcements.length === 0 ? (
				<EmptyState
					title="No announcements"
					message="Create your first announcement to share updates with your organization."
					actionLabel={canManage ? "New announcement" : undefined}
					onRetry={canManage ? openCreate : undefined}
				/>
			) : (
				<AnnouncementsTable
					items={announcements}
					canManage={canManage}
					onEdit={openEdit}
					onPublish={(announcement) =>
						requestStatusChange(announcement, "PUBLISHED")
					}
					onUnpublish={(announcement) =>
						requestStatusChange(announcement, "UNPUBLISHED")
					}
					onArchive={(announcement) =>
						requestStatusChange(announcement, "ARCHIVED")
					}
					isUpdatingStatus={statusMutation.isPending}
					isFetching={isFetching}
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
