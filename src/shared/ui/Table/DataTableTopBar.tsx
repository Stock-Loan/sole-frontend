import { Download, Search } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/input";
import type { DataTableTopBarProps } from "./types";

export function DataTableTopBar({
	enableExport,
	onExportAll,
	search,
	leftActions,
}: DataTableTopBarProps) {
	if (!enableExport && !search && !leftActions) return null;

	return (
		<div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
			{leftActions ? (
				<div className="flex flex-wrap items-center gap-2">{leftActions}</div>
			) : null}
			{search ? (
				<div className="relative flex w-full max-w-md flex-1 items-center">
					<Search
						className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground"
						aria-hidden="true"
					/>
					<Input
						value={search.value}
						onChange={(event) => search.onChange(event.target.value)}
						placeholder={search.placeholder ?? "Search"}
						aria-label={search.placeholder ?? "Search"}
						className="h-9 pl-9"
					/>
				</div>
			) : null}
			{enableExport ? (
				<div className="ml-auto flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						className="h-8 px-3 text-xs"
						onClick={onExportAll}
					>
						<Download className="mr-2 h-4 w-4" />
						Export all
					</Button>
				</div>
			) : null}
		</div>
	);
}
