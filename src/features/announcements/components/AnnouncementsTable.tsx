import { RefreshCw, Send, Archive, Undo2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import {
	ANNOUNCEMENT_STATUS_LABELS,
	ANNOUNCEMENT_STATUS_TONE,
	ANNOUNCEMENT_TYPE_COLORS,
} from "../constants";
import type { AnnouncementsTableProps } from "../types";

export function AnnouncementsTable({
	items,
	canManage,
	onEdit,
	onPublish,
	onUnpublish,
	onArchive,
	isUpdatingStatus,
	isFetching,
}: AnnouncementsTableProps) {
	return (
		<div className="overflow-x-auto rounded-xl border border-border/70">
			<Table>
				<TableHeader>
					<TableRow className="bg-muted/40">
						<TableHead>Title</TableHead>
						<TableHead>Status</TableHead>
						<TableHead>Created</TableHead>
						<TableHead>Published</TableHead>
						<TableHead>Reads</TableHead>
						{canManage ? (
							<TableHead className="text-right">Actions</TableHead>
						) : null}
					</TableRow>
				</TableHeader>
				<TableBody>
					{items.map((announcement) => (
						<TableRow key={announcement.id}>
							<TableCell>
								<div className="flex flex-col gap-1">
									<div className="flex flex-wrap items-center gap-2">
										<span className="font-semibold text-foreground">
											{announcement.title}
										</span>
									</div>
									<p className="text-sm text-muted-foreground line-clamp-2">
										{announcement.body}
									</p>
								</div>
							</TableCell>
							<TableCell>
								<div className="flex flex-col gap-1">
									<Badge
										variant="outline"
										className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
											ANNOUNCEMENT_STATUS_TONE[announcement.status]
										}`}
									>
										{ANNOUNCEMENT_STATUS_LABELS[announcement.status]}
									</Badge>
									{announcement.type ? (
										<span
											className={`inline-flex w-fit items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
												ANNOUNCEMENT_TYPE_COLORS[announcement.type] ??
												"border-border bg-muted/40 text-muted-foreground"
											}`}
										>
											{announcement.type.charAt(0) +
												announcement.type.slice(1).toLowerCase()}
										</span>
									) : null}
								</div>
							</TableCell>
							<TableCell className="text-muted-foreground">
								{formatDate(announcement.created_at)}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{announcement.published_at
									? formatDate(announcement.published_at)
									: "—"}
							</TableCell>
							<TableCell className="text-muted-foreground">
								{typeof announcement.read_count === "number" &&
								typeof announcement.target_count === "number"
									? `${announcement.read_count} / ${announcement.target_count}`
									: "—"}
							</TableCell>
							{canManage ? (
								<TableCell className="text-right">
									<div className="flex flex-wrap items-center justify-end gap-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onEdit(announcement)}
										>
											Edit
										</Button>
										{announcement.status === "PUBLISHED" ? (
											<Button
												variant="outline"
												size="sm"
												onClick={() => onUnpublish(announcement)}
												disabled={isUpdatingStatus}
											>
												<Undo2 className="mr-2 h-4 w-4" />
												Unpublish
											</Button>
										) : (
											<Button
												variant="default"
												size="sm"
												onClick={() => onPublish(announcement)}
												disabled={isUpdatingStatus}
											>
												<Send className="mr-2 h-4 w-4" />
												Publish
											</Button>
										)}
										{announcement.status !== "ARCHIVED" ? (
											<Button
												variant="destructive"
												size="sm"
												onClick={() => onArchive(announcement)}
												disabled={isUpdatingStatus}
											>
												<Archive />
												<span className="2xl:block md:hidden ml-1">
													Archive
												</span>
											</Button>
										) : null}
									</div>
								</TableCell>
							) : null}
						</TableRow>
					))}
					{isFetching ? (
						<TableRow>
							<TableCell colSpan={canManage ? 6 : 5}>
								<div className="flex items-center gap-2 text-sm text-muted-foreground">
									<RefreshCw className="h-4 w-4 animate-spin" />
									Refreshing…
								</div>
							</TableCell>
						</TableRow>
					) : null}
				</TableBody>
			</Table>
		</div>
	);
}
