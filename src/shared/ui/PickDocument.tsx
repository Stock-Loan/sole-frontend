import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { cn } from "@/shared/lib/utils";
import type { PickDocumentProps } from "@/shared/ui/types";

export function PickDocument({
	file,
	onFileChange,
	accept,
	disabled,
	label = "Pick a document to upload",
	helperText = "Drag and drop or click to browse.",
	className,
}: PickDocumentProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	return (
		<div className={cn("space-y-2", className)}>
			<div
				className={cn(
					"flex flex-col gap-3 rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-4 text-sm",
					disabled && "opacity-60"
				)}
				onClick={() => {
					if (disabled) return;
					inputRef.current?.click();
				}}
				onDragOver={(event) => {
					if (disabled) return;
					event.preventDefault();
				}}
				onDrop={(event) => {
					if (disabled) return;
					event.preventDefault();
					const droppedFile = event.dataTransfer.files?.[0];
					onFileChange(droppedFile ?? null);
				}}
				role="button"
				tabIndex={0}
				onKeyDown={(event) => {
					if (disabled) return;
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						inputRef.current?.click();
					}
				}}
			>
				<div className="flex items-center justify-between gap-3">
					<div className="space-y-1">
						<p className="font-semibold text-foreground">{label}</p>
						<p className="text-xs text-muted-foreground">{helperText}</p>
					</div>
					<div className="flex items-center gap-2 text-xs text-muted-foreground">
						<Upload className="h-4 w-4" />
						<span>{file ? "File selected" : "No file selected"}</span>
					</div>
				</div>
				<input
					ref={inputRef}
					type="file"
					accept={accept}
					className="hidden"
					disabled={disabled}
					onChange={(event) =>
						onFileChange(event.target.files?.[0] ?? null)
					}
				/>
			</div>

			{file ? (
				<div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border/60 bg-background px-3 py-2 text-sm">
					<div>
						<p className="font-semibold text-foreground">{file.name}</p>
						<p className="text-xs text-muted-foreground">
							{Math.round(file.size / 1024)} KB
						</p>
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							className="h-8 px-3 text-xs"
							disabled={disabled}
							onClick={(event) => {
								event.stopPropagation();
								inputRef.current?.click();
							}}
						>
							Change
						</Button>
						<Button
							type="button"
							variant="ghost"
							size="sm"
							className="h-8 px-3 text-xs"
							disabled={disabled}
							onClick={(event) => {
								event.stopPropagation();
								onFileChange(null);
							}}
						>
							Clear
						</Button>
					</div>
				</div>
			) : null}
		</div>
	);
}
