import { LoadingState } from "@/components/common/LoadingState";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { DataTableProps } from "./types";

export function DataTable<T>({
	data,
	columns,
	isLoading = false,
	emptyMessage = "No results",
	getRowId,
}: DataTableProps<T>) {
	if (isLoading) {
		return <LoadingState />;
	}

	if (!data.length) {
		return (
			<div className="rounded-md border border-dashed bg-muted/10 p-6 text-sm text-muted-foreground">
				{emptyMessage}
			</div>
		);
	}

	return (
		<Table>
			<TableHeader>
				<TableRow>
					{columns.map((column) => (
						<TableHead key={column.header} className={column.className}>
							{column.header}
						</TableHead>
					))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((item, index) => {
					const id = getRowId ? getRowId(item) : String(index);
					return (
						<TableRow key={id}>
							{columns.map((column) => (
								<TableCell key={column.header} className={column.className}>
									{column.render(item)}
								</TableCell>
							))}
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
