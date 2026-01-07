import { useParams } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function RequestDetailPage() {
	const { requestId } = useParams();

	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Request detail"
				subtitle={requestId ? `Request ID: ${requestId}` : "Review workflow request details."}
			/>
			<EmptyState
				title="Request details coming soon"
				message="This view will show the request timeline, documents, and approvals."
			/>
		</PageContainer>
	);
}
