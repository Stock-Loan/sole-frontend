import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

interface BulkUploadPreviewProps {
	headers: string[];
	rows: string[][];
	fileName?: string;
}

export function BulkUploadPreview({ headers, rows, fileName }: BulkUploadPreviewProps) {
	if (headers.length === 0 || rows.length === 0) {
		return null;
	}

	return (
		<div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
			<div className="flex items-center justify-between text-xs text-muted-foreground">
				<span className="font-semibold text-foreground">Preview</span>
				{fileName ? <span className="truncate">File: {fileName}</span> : null}
			</div>
			<div className="max-h-[60vh] overflow-auto rounded-md border border-border/60">
				<Table className="min-w-full">
					<TableHeader className="sticky top-0 z-10 bg-muted/70 backdrop-blur">
						<TableRow>
							<TableHead className="w-12 min-w-[3rem] text-xs">#</TableHead>
							{headers.map((header) => (
								<TableHead key={header} className="text-xs capitalize whitespace-nowrap">
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
