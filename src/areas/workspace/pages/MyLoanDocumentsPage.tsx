import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Button } from "@/shared/ui/Button";
import { LoanDocumentList } from "@/entities/loan/components/LoanDocumentList";
import { useMyLoanDocuments, useDownloadMyLoanDocument } from "@/entities/loan/hooks";
import { useToast } from "@/shared/ui/use-toast";
import { parseApiError } from "@/shared/api/errors";
import { downloadBlob } from "@/shared/lib/download";
import { routes } from "@/shared/lib/routes";
import type { LoanDocument } from "@/entities/loan/types";

export function MyLoanDocumentsPage() {
	const { id } = useParams();
	const { toast } = useToast();
	const [downloadingDocumentId, setDownloadingDocumentId] = useState<
		string | null
	>(null);

	const documentsQuery = useMyLoanDocuments(id ?? "", {
		enabled: Boolean(id),
	});
	const downloadMutation = useDownloadMyLoanDocument({
		onError: (error) => {
			toast({
				title: "Download failed",
				description: parseApiError(error).message,
				variant: "destructive",
			});
		},
	});

	const handleDownload = async (doc: LoanDocument) => {
		if (!doc.id) return;
		setDownloadingDocumentId(doc.id);
		try {
			const blob = await downloadMutation.mutateAsync(doc.id);
			downloadBlob(blob, doc.file_name ?? "document");
		} finally {
			setDownloadingDocumentId(null);
		}
	};

	if (!id) {
		return (
			<PageContainer className="space-y-4">
				<PageHeader
					title="Loan documents"
					subtitle="Review documents for this loan."
				/>
				<EmptyState
					title="Missing loan"
					message="Select a loan to view documents."
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Loan documents"
				subtitle={`Loan ID: ${id}`}
				actions={
					<Button asChild variant="outline" size="sm">
						<Link to={routes.workspaceDocuments}>Back to My Documents</Link>
					</Button>
				}
			/>

			<LoanDocumentList
				groups={documentsQuery.data?.groups ?? []}
				isLoading={documentsQuery.isLoading}
				isError={documentsQuery.isError}
				onRetry={() => documentsQuery.refetch()}
				emptyTitle="No documents uploaded yet"
				emptyMessage="Documents will show up here once uploaded."
				onDownload={handleDownload}
				downloadingDocumentId={downloadingDocumentId}
			/>
		</PageContainer>
	);
}
