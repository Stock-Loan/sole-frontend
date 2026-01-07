import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function DocumentsPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Documents"
				subtitle="Browse and manage loan documentation."
			/>
			<EmptyState
				title="Documents coming soon"
				message="Document repositories and uploads will appear here."
			/>
		</PageContainer>
	);
}
