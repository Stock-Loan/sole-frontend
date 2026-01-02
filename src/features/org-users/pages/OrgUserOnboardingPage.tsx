import { useMemo, useRef, useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileDown, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import {
	downloadOnboardingTemplate,
	uploadOnboardingCsv,
} from "../api/orgUsers.api";
import { BulkUploadPreview } from "../components/BulkUploadPreview";
import { BulkOnboardingGuide } from "../components/BulkOnboardingGuide";
import { BulkOnboardingResultsTable } from "../components/BulkOnboardingResultsTable";
import type { BulkOnboardingResult, BulkOnboardingRowResult } from "../types";

export function OrgUserOnboardingPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [bulkResult, setBulkResult] = useState<BulkOnboardingResult | null>(
		null
	);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
	const [previewRows, setPreviewRows] = useState<string[][]>([]);
	const [previewError, setPreviewError] = useState<string | null>(null);

	const downloadMutation = useMutation({
		mutationFn: downloadOnboardingTemplate,
		onSuccess: (blob) => {
			const url = URL.createObjectURL(blob);
			const link = document.createElement("a");
			link.href = url;
			link.download = "org-users-template.csv";
			document.body.appendChild(link);
			link.click();
			link.remove();
			URL.revokeObjectURL(url);
		},
		onError: (error) =>
			apiErrorToast(error, "Unable to download the CSV template right now."),
	});

	const uploadMutation = useMutation({
		mutationFn: uploadOnboardingCsv,
		onSuccess: (result) => {
			setBulkResult(result);
			const successCount =
				result.success_count ??
				(result.successes ? result.successes.length : undefined) ??
				(result.results
					? result.results.filter((row) => row.status === "success").length
					: 0);
			const failureCount =
				result.failure_count ??
				(result.errors ? result.errors.length : undefined) ??
				(result.results
					? result.results.filter((row) => row.status === "failure").length
					: 0);
			toast({
				title: "Upload processed",
				description: `${successCount ?? 0} succeeded, ${
					failureCount ?? 0
				} failed.`,
			});
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) && query.queryKey[0] === "org-users",
			});
		},
		onError: (error) =>
			apiErrorToast(
				error,
				"Upload failed. Please check the file and try again."
			),
	});

	const parseCsv = (text: string) => {
		const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
		if (lines.length === 0) {
			throw new Error("CSV appears empty.");
		}
		const headers = lines[0].split(",").map((h) => h.trim());
		const rows = lines
			.slice(1)
			.map((line) => line.split(",").map((cell) => cell.trim()));
		return {
			headers,
			rows: rows.slice(0, 50),
		};
	};

	const handleFile = async (file: File) => {
		setPreviewError(null);
		setSelectedFile(file);
		setBulkResult(null);
		setPreviewHeaders([]);
		setPreviewRows([]);

		try {
			const text = await file.text();
			const parsed = parseCsv(text);
			setPreviewHeaders(parsed.headers);
			setPreviewRows(parsed.rows);
		} catch (err) {
			console.error("CSV parse error", err);
			setPreviewError(
				"Could not read this CSV. Please check the file and try again."
			);
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			void handleFile(file);
			event.target.value = "";
		}
	};

	const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
		const file = event.dataTransfer.files?.[0];
		if (file) {
			void handleFile(file);
		}
	};

	const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
		event.preventDefault();
	};

	const handleUpload = () => {
		if (!selectedFile) return;
		uploadMutation.mutate(selectedFile);
	};

	const simplifyError = useCallback((raw: string | undefined | null) => {
		if (!raw) return "Unable to process this row.";
		const lines = raw
			.split("\n")
			.map((l) => l.trim())
			.filter(Boolean);
		return lines.slice(0, 3).join(" • ");
	}, []);

	const mapErrorRows = useMemo(
		() => (result: BulkOnboardingResult | null) => {
			if (!result) return [];
			const errors = result.errors ?? [];
			const successes = result.successes ?? [];
			const normalizedErrors: BulkOnboardingRowResult[] = errors.map((err) => ({
				row: err.row_number,
				email: err.email,
				employee_id: err.employee_id,
				status: "failure",
				message: simplifyError(err.error),
			}));
			const normalizedSuccesses: BulkOnboardingRowResult[] = successes.map(
				(row) => ({
					row: row.row_number,
					email: row.email,
					employee_id: row.employee_id,
					status: "success",
					message: row.message || "Processed",
				})
			);
			return [...normalizedSuccesses, ...normalizedErrors].sort(
				(a, b) => a.row - b.row
			);
		},
		[simplifyError]
	);

	const bulkRows = useMemo(() => {
		if (bulkResult?.results && bulkResult.results.length > 0) {
			return bulkResult.results;
		}
		return mapErrorRows(bulkResult);
	}, [bulkResult, mapErrorRows]);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Bulk onboarding"
				subtitle="Download the CSV template and upload a completed file to onboard multiple users."
				actions={
					<div className="flex gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => downloadMutation.mutate()}
							disabled={downloadMutation.isPending}
						>
							{downloadMutation.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<FileDown className="mr-2 h-4 w-4" />
							)}
							Template
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => navigate("/app/users")}
						>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to users
						</Button>
					</div>
				}
			/>

			<BulkOnboardingGuide />

			{!selectedFile ? (
				<div
					className="flex flex-col gap-3 rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-4"
					onDrop={handleDrop}
					onDragOver={handleDragOver}
					role="button"
					tabIndex={0}
					onClick={() => fileInputRef.current?.click()}
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							fileInputRef.current?.click();
						}
					}}
				>
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-1 text-sm text-muted-foreground">
							<p className="text-foreground font-semibold">
								Drop your CSV here or click to browse.
							</p>
							<p className="text-xs">
								Columns: email, first_name, last_name, timezone, phone_number,
								employee_id, employment_start_date, employment_status,
								temporary_password.
							</p>
						</div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<Upload className="h-4 w-4" />
							<span>No file selected</span>
						</div>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept=".csv"
						className="hidden"
						onChange={handleFileChange}
					/>
					<div className="text-xs text-muted-foreground">
						{previewError ? (
							<p className="text-destructive">{previewError}</p>
						) : (
							<p>Drag and drop a CSV file to preview before uploading.</p>
						)}
					</div>
					<div className="flex justify-center">
						<button
							type="button"
							className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-border/80 text-muted-foreground transition hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
							onClick={(event) => {
								event.stopPropagation();
								fileInputRef.current?.click();
							}}
							onKeyDown={(event) => {
								event.stopPropagation();
								if (event.key === "Enter" || event.key === " ") {
									event.preventDefault();
									fileInputRef.current?.click();
								}
							}}
						>
							<Upload className="h-8 w-8" />
						</button>
					</div>
				</div>
			) : (
				<div className="space-y-3 rounded-lg border border-border/70 bg-muted/20 p-4">
					<div className="flex items-center justify-between gap-2">
						<div className="space-y-1 text-sm">
							<p className="font-semibold text-foreground">
								{selectedFile.name}
							</p>
							<p className="text-xs text-muted-foreground">
								Review the preview below, then upload to process.
							</p>
						</div>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								className="h-8 px-3 text-xs"
								onClick={() => {
									setSelectedFile(null);
									setPreviewHeaders([]);
									setPreviewRows([]);
									setPreviewError(null);
									setBulkResult(null);
								}}
							>
								Clear
							</Button>
							<Button
								variant="default"
								size="sm"
								className="h-8 px-3 text-xs"
								disabled={uploadMutation.isPending}
								onClick={handleUpload}
							>
								{uploadMutation.isPending ? (
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								) : (
									<Upload className="mr-2 h-4 w-4" />
								)}
								Upload
							</Button>
						</div>
					</div>
					<BulkUploadPreview
						headers={previewHeaders}
						rows={previewRows}
						fileName={selectedFile?.name}
					/>
				</div>
			)}
			<BulkOnboardingResultsTable rows={bulkRows} />
			{bulkResult ? (
				<p className="text-xs text-muted-foreground">
					Processed {bulkResult.total_rows} rows • {bulkResult.success_count}{" "}
					succeeded, {bulkResult.failure_count} failed.
				</p>
			) : null}
		</div>
	);
}
