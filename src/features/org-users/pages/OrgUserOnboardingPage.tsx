import { useMemo, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, FileDown, Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { downloadOnboardingTemplate, uploadOnboardingCsv } from "../api/orgUsers.api";
import type { BulkOnboardingResult } from "../types";

export function OrgUserOnboardingPage() {
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const [bulkResult, setBulkResult] = useState<BulkOnboardingResult | null>(null);

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
			toast({
				title: "Upload processed",
				description: `${result.success_count} succeeded, ${result.failure_count} failed.`,
			});
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) && query.queryKey[0] === "org-users",
			});
		},
		onError: (error) =>
			apiErrorToast(error, "Upload failed. Please check the file and try again."),
	});

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			uploadMutation.mutate(file);
			event.target.value = "";
		}
	};

	const bulkRows = useMemo(() => bulkResult?.results ?? [], [bulkResult]);

	return (
		<div className="space-y-6">
			<PageHeader
				title="Bulk onboarding"
				subtitle="Download the CSV template and upload a completed file to onboard multiple users."
				actions={
					<div className="flex gap-2">
						<Button variant="outline" size="sm" onClick={() => navigate("/app/users")}>
							<ArrowLeft className="mr-2 h-4 w-4" />
							Back to users
						</Button>
					</div>
				}
			/>
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between gap-3">
						<div>
							<CardTitle>Bulk onboarding via CSV</CardTitle>
							<CardDescription>
								Use the template, then upload your completed file.
							</CardDescription>
						</div>
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
					</div>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between rounded-lg border border-dashed border-border/70 bg-muted/30 px-4 py-3">
						<div className="space-y-1 text-sm text-muted-foreground">
							<p>Upload your completed CSV to process onboarding in bulk.</p>
							<p className="text-xs">
								Columns: email, first_name, last_name, timezone, phone_number, employee_id,
								employment_start_date, employment_status.
							</p>
						</div>
						<Button
							variant="default"
							size="sm"
							onClick={() => fileInputRef.current?.click()}
							disabled={uploadMutation.isPending}
						>
							{uploadMutation.isPending ? (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Upload className="mr-2 h-4 w-4" />
							)}
							Upload CSV
						</Button>
						<input
							ref={fileInputRef}
							type="file"
							accept=".csv"
							className="hidden"
							onChange={handleFileChange}
						/>
					</div>
					{bulkRows.length > 0 ? (
						<div className="overflow-hidden rounded-lg border border-border/60">
							<Table>
								<TableHeader>
									<TableRow className="bg-muted/40">
										<TableHead>Row</TableHead>
										<TableHead>Email</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Message</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{bulkRows.map((row) => (
										<TableRow key={`${row.row}-${row.email ?? row.status}`}>
											<TableCell className="font-semibold">{row.row}</TableCell>
											<TableCell>{row.email || "—"}</TableCell>
											<TableCell className="capitalize">{row.status}</TableCell>
											<TableCell className="text-sm text-muted-foreground">
												{row.message || "—"}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>
					) : null}
					{bulkResult ? (
						<p className="text-xs text-muted-foreground">
							Processed {bulkResult.total_rows} rows • {bulkResult.success_count} succeeded,{" "}
							{bulkResult.failure_count} failed.
						</p>
					) : null}
				</CardContent>
			</Card>
		</div>
	);
}
