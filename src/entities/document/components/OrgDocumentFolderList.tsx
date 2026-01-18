import { Folder, FolderOpen, MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { cn } from "@/shared/lib/utils";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import type { OrgDocumentFolderListProps } from "@/entities/document/components/types";

export function OrgDocumentFolderList({
	folders,
	selectedFolderId,
	onSelect,
	onCreate,
	onRename,
	onDelete,
	isLoading,
	isError,
	onRetry,
	canManage = false,
}: OrgDocumentFolderListProps) {
	const totalTemplates = folders.reduce(
		(acc, folder) => acc + (folder.template_count ?? 0),
		0
	);

	if (isLoading) {
		return (
			<Card className="h-full">
				<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
					<CardTitle className="text-sm font-semibold">Folders</CardTitle>
					<Skeleton className="h-8 w-8" />
				</CardHeader>
				<CardContent className="space-y-3">
					{Array.from({ length: 4 }).map((_, index) => (
						<Skeleton key={`folder-skel-${index}`} className="h-10 w-full" />
					))}
				</CardContent>
			</Card>
		);
	}

	if (isError) {
		return (
			<Card className="h-full">
				<CardHeader className="pb-2">
					<CardTitle className="text-sm font-semibold">Folders</CardTitle>
				</CardHeader>
				<CardContent>
					<EmptyState
						title="Unable to load folders"
						message="We couldn't fetch document folders."
						actionLabel="Retry"
						onRetry={onRetry}
					/>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="h-full">
			<CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
				<CardTitle className="text-sm font-semibold">Folders</CardTitle>
				{canManage ? (
					<Button variant="outline" size="icon" onClick={onCreate}>
						<Plus className="h-4 w-4" />
					</Button>
				) : null}
			</CardHeader>
			<CardContent className="space-y-2 text-sm">
				<button
					type="button"
					onClick={() => onSelect(null)}
					className={cn(
						"group flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2 text-left transition",
						selectedFolderId === null
							? "border-primary/50 bg-primary/5 text-primary"
							: "border-border/60 hover:border-primary/30 hover:bg-muted/40"
					)}
				>
					<div className="flex items-center gap-2">
						{selectedFolderId === null ? (
							<FolderOpen className="h-4 w-4 text-primary" />
						) : (
							<Folder className="h-4 w-4 text-muted-foreground" />
						)}
						<span className="font-medium">All templates</span>
					</div>
					<span className="text-xs text-muted-foreground tabular-nums">
						{totalTemplates}
					</span>
				</button>

				{folders.length === 0 ? (
					<EmptyState
						title="No folders yet"
						message="Create a custom folder to organize templates."
					/>
				) : (
					folders.map((folder) => {
						const isSelected = selectedFolderId === folder.id;
						return (
							<div
								key={folder.id}
								className={cn(
									"group flex items-center justify-between gap-2 rounded-lg border px-3 py-2 transition",
									isSelected
										? "border-primary/50 bg-primary/5 text-primary"
										: "border-border/60 hover:border-primary/30 hover:bg-muted/40"
								)}
							>
								<button
									type="button"
									onClick={() => onSelect(folder.id)}
									className="flex flex-1 items-center gap-2 text-left"
								>
									{isSelected ? (
										<FolderOpen className="h-4 w-4 text-primary" />
									) : (
										<Folder className="h-4 w-4 text-muted-foreground" />
									)}
									<div className="min-w-0 flex-1">
										<div className="truncate text-sm font-medium">
											{folder.name}
										</div>
										{folder.is_system ? (
											<span className="text-[11px] text-muted-foreground">
												System folder
											</span>
										) : null}
									</div>
								</button>
								<span className="text-xs text-muted-foreground tabular-nums">
									{folder.template_count ?? 0}
								</span>
								{canManage && !folder.is_system ? (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button
												variant="ghost"
												size="icon"
												className="h-8 w-8 opacity-0 group-hover:opacity-100"
											>
												<MoreHorizontal className="h-4 w-4" />
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end" className="w-40">
											<DropdownMenuItem onClick={() => onRename(folder)}>
												Rename
											</DropdownMenuItem>
											<DropdownMenuSeparator />
											<DropdownMenuItem
												className="text-destructive"
												onClick={() => onDelete(folder)}
											>
												Delete
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								) : null}
							</div>
						);
					})
				)}
			</CardContent>
		</Card>
	);
}
