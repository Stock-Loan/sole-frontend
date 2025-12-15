import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { BulkUploadPreviewProps } from "../types";

export function BulkUploadPreview({ headers, rows }: BulkUploadPreviewProps) {
	if (headers.length === 0 || rows.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2 ">
			<div className="max-h-[60vh] overflow-auto rounded-md border border-border/60">
				<Table className="min-w-full">
					<TableHeader>
						<TableRow className="bg-muted/90 backdrop-blur supports-[backdrop-filter]:bg-muted/70">
							<TableHead className="sticky top-0 z-20 w-12 min-w-[3rem] text-xs bg-inherit">
								#
							</TableHead>
							{headers.map((header) => (
								<TableHead
									key={header}
									className="sticky top-0 z-20 bg-inherit text-xs capitalize whitespace-nowrap"
								>
									{header}
								</TableHead>
							))}
						</TableRow>
					</TableHeader>
					<TableBody>
						{rows.map((row, index) => (
							<TableRow key={`preview-${index}`}>
								<TableCell className="w-12 text-xs font-semibold">
									{index + 1}
								</TableCell>
								{headers.map((_, colIndex) => (
									<TableCell key={`${index}-${colIndex}`} className="text-xs">
										{row[colIndex] ?? ""}
									</TableCell>
								))}
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<p className="text-[11px] text-muted-foreground">
				Showing first {rows.length} rows from the uploaded file.
			</p>
		</div>
	);
}
