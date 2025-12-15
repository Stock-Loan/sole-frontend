import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { BulkOnboardingResultsTableProps } from "../types";

export function BulkOnboardingResultsTable({ rows }: BulkOnboardingResultsTableProps) {
	if (!rows.length) return null;

	return (
		<div className="overflow-hidden rounded-lg border border-border/60">
			<div className="max-h-80 overflow-y-auto">
				<Table className="min-w-full">
					<TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
						<TableRow>
							<TableHead className="w-16">Row</TableHead>
							<TableHead className="w-32">Status</TableHead>
							<TableHead>Message</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row) => (
							<TableRow key={`${row.row}-${row.email ?? row.status}`}>
								<TableCell className="font-semibold">{row.row}</TableCell>
								<TableCell className="capitalize whitespace-nowrap">
									{row.status}
								</TableCell>
								<TableCell className="text-sm text-muted-foreground">
									{row.message || "—"}
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
