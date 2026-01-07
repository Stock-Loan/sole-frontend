import { Download, X } from "lucide-react";
import {
	Toolbar,
	ToolbarButton,
	ToolbarGroup,
	ToolbarSeparator,
} from "@/shared/ui/toolbar";
import type { DataTableSelectionToolbarProps } from "./types";

export function DataTableSelectionToolbar({
	selectionCount,
	enableExport,
	onClearSelection,
	onExportSelected,
	toolbarContent,
}: DataTableSelectionToolbarProps) {
	if (selectionCount <= 0) return null;

	return (
		<div className="pointer-events-none fixed bottom-4 left-1/2 z-40 w-fit max-w-[calc(100vw-2rem)] -translate-x-1/2">
			<Toolbar className="pointer-events-auto w-fit max-w-full flex-wrap rounded-lg border border-border/70 bg-background/95 px-3 py-2 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-2">
				<ToolbarGroup className="text-xs font-normal text-foreground">
					<span>{selectionCount} selected</span>
					<ToolbarButton
						variant="ghost"
						size="sm"
						className="h-7 px-2"
						onClick={onClearSelection}
					>
						<X className="mr-1 h-4 w-4" />
						Clear
					</ToolbarButton>
				</ToolbarGroup>
				{enableExport || toolbarContent ? (
					<>
						<ToolbarSeparator />
						<ToolbarGroup className="ml-auto">
							{enableExport ? (
								<ToolbarButton
									variant="outline"
									size="sm"
									onClick={onExportSelected}
								>
									<Download className="mr-2 h-4 w-4" />
									Export selected
								</ToolbarButton>
							) : null}
							{toolbarContent}
						</ToolbarGroup>
					</>
				) : null}
			</Toolbar>
		</div>
	);
}
