import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/Button";
import { PickDocument } from "@/shared/ui/PickDocument";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import { normalizeDisplay } from "@/shared/lib/utils";
import { formatDate } from "@/shared/lib/format";
import type { WorkflowStagePanelProps } from "@/entities/loan/components/types";

const STAGE_STATUS_OPTIONS = ["PENDING", "IN_PROGRESS", "COMPLETED"] as const;

export function WorkflowStagePanel({
	title,
	description,
	stageType,
	stage,
	assigneeName,
	documentGroups,
	requiredDocumentTypes,
	documentTypeOptions,
	onUploadDocument,
	onUpdateStage,
	isRegistering,
	isUpdating,
	disableDocumentForm,
}: WorkflowStagePanelProps) {
	const { toast } = useToast();
	const stageDocuments = useMemo(() => {
		const group = documentGroups.find(
			(item) => item.stage_type === stageType
		);
		return group?.documents ?? [];
	}, [documentGroups, stageType]);

	const existingTypes = useMemo(() => {
		return new Set(
			stageDocuments
				.map((doc) => doc.document_type)
				.filter((value): value is string => Boolean(value))
		);
	}, [stageDocuments]);

	const missingRequired = useMemo(
		() =>
			requiredDocumentTypes.filter((type) => !existingTypes.has(type)),
		[requiredDocumentTypes, existingTypes]
	);
	const canComplete = missingRequired.length === 0;
	const hasDocumentOptions = documentTypeOptions.length > 0;
	const optionalDocumentOptions = useMemo(
		() =>
			documentTypeOptions.filter(
				(option) => !requiredDocumentTypes.includes(option.value)
			),
		[documentTypeOptions, requiredDocumentTypes]
	);

	const [documentType, setDocumentType] = useState(
		documentTypeOptions[0]?.value ?? ""
	);
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [docError, setDocError] = useState<string | null>(null);

	const [status, setStatus] = useState(stage?.status ?? "PENDING");
	const [notes, setNotes] = useState(stage?.notes ?? "");
	const [stageError, setStageError] = useState<string | null>(null);

	const handleRegister = async () => {
		if (disableDocumentForm || !hasDocumentOptions) return;
		if (!documentType || !selectedFile) {
			setDocError("Pick a document to upload.");
			return;
		}

		setDocError(null);
		try {
			await onUploadDocument({
				document_type: documentType,
				file: selectedFile,
			});
			setSelectedFile(null);
			toast({
				title: "Document registered",
				description: "The document metadata has been saved.",
			});
		} catch (error) {
			setDocError(parseApiError(error).message);
		}
	};

	const handleUpdateStage = async () => {
		if (status === "COMPLETED" && !canComplete) {
			setStageError("Upload required documents before completing the stage.");
			return;
		}
		setStageError(null);
		try {
			await onUpdateStage({
				status,
				notes: notes.trim() ? notes.trim() : null,
			});
			toast({
				title: "Stage updated",
				description: "Workflow stage status has been updated.",
			});
		} catch (error) {
			setStageError(parseApiError(error).message);
		}
	};

	return (
		<div className="space-y-4 pb-6">
			<Card>
				<CardHeader>
					<CardTitle>{title}</CardTitle>
					{description ? (
						<p className="text-sm text-muted-foreground">{description}</p>
					) : null}
				</CardHeader>
				<CardContent className="space-y-3 text-sm text-muted-foreground">
					<p className="text-sm font-medium text-foreground">Required documents</p>
					{requiredDocumentTypes.length === 0 ? (
						<p>No required documents for this stage.</p>
					) : (
						<ul className="space-y-1">
							{requiredDocumentTypes.map((docType) => {
								const hasDoc = existingTypes.has(docType);
								return (
									<li
										key={docType}
										className="flex items-center gap-2 text-sm"
									>
										{hasDoc ? (
											<CheckCircle2 className="h-4 w-4 text-emerald-500" />
										) : (
											<AlertCircle className="h-4 w-4 text-amber-500" />
										)}
										<span>{normalizeDisplay(docType)}</span>
									</li>
								);
							})}
						</ul>
					)}
					{optionalDocumentOptions.length > 0 ? (
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Optional documents
							</p>
							<ul className="space-y-1">
								{optionalDocumentOptions.map((option) => {
									const hasDoc = existingTypes.has(option.value);
									return (
										<li
											key={option.value}
											className="flex items-center gap-2 text-sm"
										>
											{hasDoc ? (
												<CheckCircle2 className="h-4 w-4 text-emerald-500" />
											) : (
												<AlertCircle className="h-4 w-4 text-muted-foreground" />
											)}
											<span>{option.label}</span>
										</li>
									);
								})}
							</ul>
						</div>
					) : null}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Register document</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					{disableDocumentForm ? (
						<p className="text-sm text-muted-foreground">
							You don't have permission to register documents for this stage.
						</p>
					) : null}
					<div className="space-y-1 max-w-[260px]">
						<Label className="text-xs text-muted-foreground">
							Document type
						</Label>
						<Select
							value={documentType}
							onValueChange={setDocumentType}
							disabled={disableDocumentForm || !hasDocumentOptions}
						>
							<SelectTrigger className="h-9">
								<SelectValue placeholder="Select type" />
							</SelectTrigger>
							<SelectContent>
								{documentTypeOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<PickDocument
						file={selectedFile}
						onFileChange={setSelectedFile}
						disabled={disableDocumentForm}
					/>
					{docError ? (
						<p className="text-sm text-destructive">{docError}</p>
					) : null}
					<Button
						size="sm"
						variant="outline"
						onClick={handleRegister}
						disabled={
							disableDocumentForm ||
							isRegistering ||
							!hasDocumentOptions
						}
					>
						{isRegistering ? "Saving..." : "Register document"}
					</Button>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Stage status</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="rounded-lg border border-border/60 bg-muted/10 px-3 py-2 text-xs text-muted-foreground">
						<p>
							Assigned to:{" "}
							<span className="font-medium text-foreground">
								{assigneeName ?? "Unassigned"}
							</span>
						</p>
						<p>
							Assigned at:{" "}
							<span className="font-medium text-foreground">
								{formatDate(stage?.assigned_at)}
							</span>
						</p>
					</div>
					<div className="grid gap-3 md:grid-cols-2">
						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">Status</Label>
							<Select value={status} onValueChange={setStatus}>
								<SelectTrigger className="h-9 w-[200px]">
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									{STAGE_STATUS_OPTIONS.map((option) => (
										<SelectItem
											key={option}
											value={option}
											disabled={option === "COMPLETED" && !canComplete}
										>
											{normalizeDisplay(option)}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1">
							<Label className="text-xs text-muted-foreground">Notes</Label>
							<Textarea
								value={notes}
								onChange={(event) => setNotes(event.target.value)}
								placeholder="Add notes for reviewers"
								className="min-h-[80px]"
							/>
						</div>
					</div>
					{!canComplete ? (
						<p className="text-xs text-muted-foreground">
							Upload all required documents before marking this stage complete.
						</p>
					) : null}
					{stageError ? (
						<p className="text-sm text-destructive">{stageError}</p>
					) : null}
					<Button
						size="sm"
						onClick={handleUpdateStage}
						disabled={isUpdating || (status === "COMPLETED" && !canComplete)}
					>
						{isUpdating ? "Updating..." : "Update stage"}
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
