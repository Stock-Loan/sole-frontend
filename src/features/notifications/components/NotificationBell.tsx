import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/Button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Skeleton } from "@/shared/ui/Skeleton";
import { cn } from "@/shared/lib/utils";
import { useToast } from "@/shared/ui/use-toast";
import { formatDate } from "@/shared/lib/format";
import { ANNOUNCEMENT_TYPE_COLORS } from "@/entities/announcement/constants";
import {
	useMarkNotificationRead,
	useRecentNotifications,
	useAnnouncementStream,
	useUnreadNotificationCount,
	useUnreadNotifications,
} from "../hooks";
import { notificationToasts } from "../toasts";
import { useAuth } from "@/auth/hooks";
import type { Announcement } from "@/entities/announcement/types";

export function NotificationBell() {
	const { user } = useAuth();
	const canView = Boolean(user);
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const [selectedAnnouncement, setSelectedAnnouncement] =
		useState<Announcement | null>(null);
	const unreadListQuery = useUnreadNotifications(canView);
	const unreadCountQuery = useUnreadNotificationCount(canView);
	const recentReadQuery = useRecentNotifications(open && canView);
	const markReadMutation = useMarkNotificationRead();
	useAnnouncementStream(canView);

	const announcements = useMemo(
		() => unreadListQuery.data?.items ?? [],
		[unreadListQuery.data?.items],
	);
	const unreadIds = useMemo(
		() => new Set(announcements.map((item) => item.id)),
		[announcements],
	);
	const recentRead = useMemo(
		() =>
			(recentReadQuery.data?.items ?? []).filter(
				(item) => !unreadIds.has(item.id),
			),
		[recentReadQuery.data?.items, unreadIds],
	);
	const unreadCount = unreadCountQuery.data?.unread ?? announcements.length;

	const handleMarkRead = async (id: string) => {
		try {
			await markReadMutation.mutateAsync(id);
			toast(notificationToasts.markedRead());
		} catch {
			toast(notificationToasts.markReadError());
		}
	};

	const handleOpenAnnouncement = (announcement: Announcement) => {
		setSelectedAnnouncement(announcement);
		setOpen(false);
		if (unreadIds.has(announcement.id)) {
			void handleMarkRead(announcement.id);
		}
	};

	return (
		<>
			<DropdownMenu open={open} onOpenChange={setOpen}>
				<DropdownMenuTrigger asChild>
					<Button
						variant="ghost"
						size="icon"
						aria-label="Notifications"
						className="relative"
					>
						<Bell className="h-6 w-6" />
						{canView && unreadCount > 0 ? (
							<span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1 text-[11px] font-semibold text-destructive-foreground">
								{unreadCount}
							</span>
						) : null}
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end" className="w-96">
					<DropdownMenuLabel>Announcements</DropdownMenuLabel>
					<DropdownMenuSeparator />
					{!canView ? (
						<DropdownMenuItem className="text-muted-foreground" disabled>
							Sign in to view announcements.
						</DropdownMenuItem>
					) : unreadListQuery.isLoading ? (
						<DropdownMenuItem disabled>
							<div className="w-full space-y-2 py-1">
								<Skeleton className="h-4 w-32" />
								<Skeleton className="h-3 w-full" />
								<Skeleton className="h-3 w-[88%]" />
							</div>
						</DropdownMenuItem>
					) : announcements.length === 0 && recentRead.length === 0 ? (
						<DropdownMenuItem className="text-muted-foreground" disabled>
							No announcements yet.
						</DropdownMenuItem>
					) : null}
					{announcements.map((item) => (
						<DropdownMenuItem
							key={item.id}
							className="flex cursor-pointer flex-col items-start gap-1"
							onSelect={() => handleOpenAnnouncement(item)}
						>
							<div className="flex w-full items-center gap-2">
								<div className={cn("text-sm font-semibold")}>{item.title}</div>
								{item.type ? (
									<span
										className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
											ANNOUNCEMENT_TYPE_COLORS[item.type] ??
											"border-border bg-muted/40 text-muted-foreground"
										}`}
									>
										{item.type.charAt(0) + item.type.slice(1).toLowerCase()}
									</span>
								) : null}
								<span
									className="ml-auto h-2 w-2 rounded-full bg-primary"
									aria-label="Unread announcement"
								/>
							</div>
							<p className="text-xs text-muted-foreground line-clamp-2">
								{item.body}
							</p>
							<p className="text-[11px] text-muted-foreground">
								Published {formatDate(item.published_at)}
							</p>
						</DropdownMenuItem>
					))}
					{announcements.length > 0 && recentRead.length > 0 ? (
						<DropdownMenuSeparator />
					) : null}
					{recentRead.length > 0 ? (
						<>
							<DropdownMenuLabel>Recent</DropdownMenuLabel>
							{recentRead.map((item) => (
								<DropdownMenuItem
									key={`read-${item.id}`}
									className="flex cursor-pointer flex-col items-start gap-1 opacity-75"
									onSelect={() => handleOpenAnnouncement(item)}
								>
									<div className="flex w-full items-center gap-2">
										<div className="text-sm font-semibold">{item.title}</div>
										{item.type ? (
											<span
												className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
													ANNOUNCEMENT_TYPE_COLORS[item.type] ??
													"border-border bg-muted/40 text-muted-foreground"
												}`}
											>
												{item.type.charAt(0) + item.type.slice(1).toLowerCase()}
											</span>
										) : null}
									</div>
									<p className="text-xs text-muted-foreground line-clamp-2">
										{item.body}
									</p>
									<p className="text-[11px] text-muted-foreground">
										Published {formatDate(item.published_at)}
									</p>
								</DropdownMenuItem>
							))}
						</>
					) : null}
				</DropdownMenuContent>
			</DropdownMenu>
			<Dialog
				open={Boolean(selectedAnnouncement)}
				onOpenChange={(isOpen) => {
					if (!isOpen) {
						setSelectedAnnouncement(null);
					}
				}}
			>
				<DialogContent size="md">
					<DialogHeader>
						<DialogTitle>
							{selectedAnnouncement?.title ?? "Announcement"}
						</DialogTitle>
						<DialogDescription>
							{selectedAnnouncement?.published_at
								? `Published ${formatDate(selectedAnnouncement.published_at)}`
								: "Announcement details"}
						</DialogDescription>
					</DialogHeader>
					<DialogBody className="space-y-4">
						{selectedAnnouncement?.type ? (
							<div>
								<span
									className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
										ANNOUNCEMENT_TYPE_COLORS[selectedAnnouncement.type] ??
										"border-border bg-muted/40 text-muted-foreground"
									}`}
								>
									{selectedAnnouncement.type.charAt(0) +
										selectedAnnouncement.type.slice(1).toLowerCase()}
								</span>
							</div>
						) : null}
						<div className="max-h-[55vh] overflow-auto rounded-lg border border-border/70 bg-muted/20 p-4">
							<p className="text-sm leading-6 whitespace-pre-wrap">
								{selectedAnnouncement?.body ?? ""}
							</p>
						</div>
					</DialogBody>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setSelectedAnnouncement(null)}
						>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
