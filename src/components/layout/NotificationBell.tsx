import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, Loader2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import {
	getUnreadAnnouncementCount,
	listAnnouncements,
	listUnreadAnnouncements,
	markAnnouncementRead,
} from "@/features/announcements/api/announcements.api";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/format";
import { ANNOUNCEMENT_TYPE_COLORS } from "@/features/announcements/constants";

export function NotificationBell() {
	const { can } = usePermissions();
	const canView = can("announcement.view");
	const { toast } = useToast();
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const unreadListQuery = useQuery({
		queryKey: queryKeys.announcements.unread(),
		queryFn: () => listUnreadAnnouncements(),
		enabled: open && canView,
		staleTime: 30 * 1000,
	});

	const unreadCountQuery = useQuery({
		queryKey: queryKeys.announcements.unreadCount(),
		queryFn: () => getUnreadAnnouncementCount(),
		enabled: canView,
		staleTime: 30 * 1000,
	});

	const recentReadQuery = useQuery({
		queryKey: queryKeys.announcements.list({
			status: "PUBLISHED",
			page: 1,
			page_size: 10,
		}),
		queryFn: () => listAnnouncements({ status: "PUBLISHED", page: 1, page_size: 10 }),
		enabled: open && canView,
		staleTime: 30 * 1000,
	});

	const announcements = useMemo(
		() => unreadListQuery.data?.items ?? [],
		[unreadListQuery.data?.items]
	);
	const unreadIds = useMemo(() => new Set(announcements.map((item) => item.id)), [announcements]);
	const recentRead = useMemo(
		() =>
			(recentReadQuery.data?.items ?? []).filter(
				(item) => !unreadIds.has(item.id)
			),
		[recentReadQuery.data?.items, unreadIds]
	);
	const unreadCount = unreadCountQuery.data?.count ?? announcements.length;

	const handleMarkRead = async (id: string) => {
		try {
			await markAnnouncementRead(id);
			queryClient.invalidateQueries({
				queryKey: queryKeys.announcements.unread(),
			});
			queryClient.invalidateQueries({
				queryKey: queryKeys.announcements.unreadCount(),
			});
			toast({ title: "Marked as read" });
		} catch {
			toast({ title: "Unable to mark read", variant: "destructive" });
		}
	};

	return (
		<DropdownMenu open={open} onOpenChange={setOpen}>
			<DropdownMenuTrigger asChild disabled={!canView}>
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
						You don&apos;t have permission to view announcements.
					</DropdownMenuItem>
				) : unreadListQuery.isLoading ? (
					<DropdownMenuItem className="text-muted-foreground" disabled>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Loading…
					</DropdownMenuItem>
				) : announcements.length === 0 && recentRead.length === 0 ? (
					<DropdownMenuItem className="text-muted-foreground" disabled>
						No announcements yet.
					</DropdownMenuItem>
				) : (
					announcements.map((item) => (
						<DropdownMenuItem
							key={item.id}
							className="flex flex-col items-start gap-1"
							onSelect={() => handleMarkRead(item.id)}
						>
							<div className="flex w-full items-center gap-2">
								<div className={cn("text-sm font-semibold")}>
									{item.title}
								</div>
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
					))
				)}
				{announcements.length > 0 && recentRead.length > 0 ? (
					<DropdownMenuSeparator />
				) : null}
				{recentRead.length > 0 ? (
					<>
						<DropdownMenuLabel>Recent</DropdownMenuLabel>
						{recentRead.map((item) => (
							<DropdownMenuItem
								key={`read-${item.id}`}
								className="flex flex-col items-start gap-1 opacity-75"
								onSelect={() => handleMarkRead(item.id)}
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
	);
}
