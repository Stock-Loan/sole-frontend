import { Button } from "@/components/ui/button";

interface PaginationProps {
	page: number;
	pageSize: number;
	total?: number;
	hasNext?: boolean;
	isLoading?: boolean;
	onPageChange: (page: number) => void;
}

export function Pagination({
	page,
	pageSize,
	total,
	hasNext,
	isLoading = false,
	onPageChange,
}: PaginationProps) {
	const hasPrev = page > 1;
	const computedHasNext =
		typeof total === "number" ? page * pageSize < total : Boolean(hasNext);

	const totalPages =
		typeof total === "number"
			? Math.max(1, Math.ceil(total / pageSize))
			: undefined;

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground mt-8">
			<div className="flex items-center gap-2">
				<span>
					Page {page}
					{totalPages ? ` of ${totalPages}` : ""}
					{typeof total === "number" ? ` • ${total} items` : ""}
				</span>
				{isLoading ? <span className="text-xs">Updating…</span> : null}
			</div>
			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="sm"
					disabled={!hasPrev || isLoading}
					onClick={() => onPageChange(Math.max(1, page - 1))}
				>
					Previous
				</Button>
				<Button
					variant="outline"
					size="sm"
					disabled={!computedHasNext || isLoading}
					onClick={() => onPageChange(page + 1)}
				>
					Next
				</Button>
			</div>
		</div>
	);
}
