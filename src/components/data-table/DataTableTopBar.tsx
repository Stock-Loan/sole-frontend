import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DataTableTopBarProps } from "./types";

export function DataTableTopBar({
	enableExport,
	onExportAll,
}: DataTableTopBarProps) {
	if (!enableExport) return null;

	return (
		<div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
			<div className="ml-auto flex flex-wrap items-center gap-2">
				<Button variant="outline" size="sm" onClick={onExportAll}>
					<Download className="mr-2 h-4 w-4" />
					Export all
				</Button>
			</div>
		</div>
	);
}
