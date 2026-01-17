import { Download, Search } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/input";
import type { DataTableHeaderAction, DataTableTopBarProps } from "./types";

export function DataTableTopBar({
	enableExport,
	onExportAll,
	search,
	headerActions,
}: DataTableTopBarProps) {
	const primaryAction = headerActions?.primaryAction ?? null;
	const secondaryActions = headerActions?.secondaryActions ?? [];
	const hasActions = Boolean(primaryAction || secondaryActions.length > 0);
	if (!enableExport && !search && !hasActions) return null;

	const renderAction = (
		action: DataTableHeaderAction,
		defaultVariant: "default" | "outline"
	) => {
		const Icon = action.icon;
		return (
			<Button
				key={action.label}
				variant={action.variant ?? defaultVariant}
				size={action.size ?? "sm"}
				onClick={action.onClick}
				disabled={action.disabled}
				title={action.title}
			>
				{Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
				{action.label}
			</Button>
		);
	};

	return (
		<div className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/20 px-4 py-3">
			{hasActions ? (
				<div className="flex flex-wrap items-center gap-2">
					{primaryAction ? renderAction(primaryAction, "default") : null}
					{secondaryActions.map((action) =>
						renderAction(action, "outline")
					)}
				</div>
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
