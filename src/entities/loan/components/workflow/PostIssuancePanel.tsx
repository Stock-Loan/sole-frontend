import { useMemo, useState } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { PickDocument } from "@/shared/ui/PickDocument";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import { normalizeDisplay } from "@/shared/lib/utils";
import { StageStatusBadge } from "@/entities/loan/components/loan-pages/StageStatusBadge";
import type { PostIssuancePanelProps } from "@/entities/loan/types";

const SHARE_CERTIFICATE_TYPE = "SHARE_CERTIFICATE";

export function PostIssuancePanel({
	stage,
	documentGroups,
	onUploadDocument,
	isRegistering,
	disableDocumentForm,
}: PostIssuancePanelProps) {
	const { toast } = useToast();
	const stageDocuments = useMemo(() => {
		const group = documentGroups.find(
			(item) => item.stage_type === "LEGAL_POST_ISSUANCE",
		);
		return group?.documents ?? [];
	}, [documentGroups]);
	const hasShareCertificate = useMemo(
		() =>
			stageDocuments.some(
				(doc) => doc.document_type === SHARE_CERTIFICATE_TYPE,
			),
		[stageDocuments],
	);

	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleRegister = async () => {
		if (disableDocumentForm) return;
		if (!selectedFile) {
			setErrorMessage("Pick a document to upload.");
			return;
		}
		setErrorMessage(null);
		try {
			await onUploadDocument({
				document_type: SHARE_CERTIFICATE_TYPE,
				file: selectedFile,
			});
			setSelectedFile(null);
			toast({
				title: "Share certificate registered",
				description: "Post-issuance document has been saved.",
			});
		} catch (error) {
			setErrorMessage(parseApiError(error).message);
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Post-issuance documents</CardTitle>
				<p className="text-sm text-muted-foreground">
					Register share certificates after the loan is active.
				</p>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
					<span>Required document:</span>
					<span className="font-medium text-foreground">
						{normalizeDisplay(SHARE_CERTIFICATE_TYPE)}
					</span>
					{hasShareCertificate ? (
						<CheckCircle2 className="h-4 w-4 text-emerald-500" />
					) : (
						<AlertCircle className="h-4 w-4 text-amber-500" />
					)}
					{stage?.status ? <StageStatusBadge status={stage.status} /> : null}
				</div>

				{disableDocumentForm ? (
					<p className="text-sm text-muted-foreground">
						You don't have permission to register post-issuance documents.
					</p>
				) : null}

				<PickDocument
					file={selectedFile}
					onFileChange={setSelectedFile}
					disabled={disableDocumentForm}
				/>

				{errorMessage ? (
					<p className="text-sm text-destructive">{errorMessage}</p>
				) : null}

				<Button
					size="sm"
					variant="outline"
					onClick={handleRegister}
					disabled={disableDocumentForm || isRegistering}
				>
					{isRegistering ? "Saving..." : "Register share certificate"}
				</Button>
			</CardContent>
		</Card>
	);
}
