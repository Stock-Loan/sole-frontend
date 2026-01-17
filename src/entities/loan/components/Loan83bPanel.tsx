import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { PickDocument } from "@/shared/ui/PickDocument";
import { formatDate } from "@/shared/lib/format";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import type { Loan83bPanelProps } from "@/entities/loan/components/types";

export function Loan83bPanel({
	loanId,
	dueDate,
	daysUntilDue,
	onRegister,
	isRegistering,
}: Loan83bPanelProps) {
	const { toast } = useToast();
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const urgency = useMemo(() => {
		if (daysUntilDue === null || daysUntilDue === undefined) return "neutral";
		if (daysUntilDue <= 0) return "danger";
		if (daysUntilDue <= 7) return "danger";
		if (daysUntilDue <= 14) return "warning";
		return "neutral";
	}, [daysUntilDue]);

	const panelClassName =
		urgency === "danger"
			? "border-red-200 bg-red-50/60"
			: urgency === "warning"
				? "border-amber-200 bg-amber-50/60"
				: "border-border bg-card";

	const handleRegister = async () => {
		if (!selectedFile) {
			setErrorMessage("Pick a document to upload.");
			return;
		}
		setErrorMessage(null);
		try {
			await onRegister({
				document_type: "SECTION_83B_ELECTION",
				file_name: selectedFile.name,
				storage_path_or_url: selectedFile.name,
			});
			setSelectedFile(null);
			toast({
				title: "83(b) election registered",
				description: "Your document has been saved successfully.",
			});
		} catch (error) {
			setErrorMessage(parseApiError(error).message);
		}
	};

	return (
		<Card className={panelClassName}>
			<CardHeader>
				<CardTitle className="text-sm font-semibold">
					83(b) Election
				</CardTitle>
				<p className="text-sm text-muted-foreground">
					File your 83(b) election after your loan activates.
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
					<span className="inline-flex items-center gap-1">
						<Clock className="h-4 w-4" />
						Due date: {formatDate(dueDate)}
					</span>
					{daysUntilDue !== null && daysUntilDue !== undefined ? (
						<span className="inline-flex items-center gap-1">
							{urgency === "danger" ? (
								<AlertTriangle className="h-4 w-4 text-red-500" />
							) : (
								<CheckCircle2 className="h-4 w-4 text-emerald-500" />
							)}
							{daysUntilDue} days remaining
						</span>
					) : null}
					<span className="text-xs text-muted-foreground">
						Loan ID: {loanId}
					</span>
				</div>

				<PickDocument
					file={selectedFile}
					onFileChange={setSelectedFile}
				/>

				{errorMessage ? (
					<p className="text-sm text-destructive">{errorMessage}</p>
				) : null}

				<Button size="sm" onClick={handleRegister} disabled={isRegistering}>
					{isRegistering ? "Saving..." : "Register 83(b) election"}
				</Button>
			</CardContent>
		</Card>
	);
}
