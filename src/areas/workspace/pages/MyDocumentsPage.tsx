import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function MyDocumentsPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="My documents"
				subtitle="Review your loan documents and upload required forms."
			/>
			<EmptyState
				title="Loan documents coming soon"
				message="This workspace will show your personal loan documents and upload status."
			/>
		</PageContainer>
	);
}
