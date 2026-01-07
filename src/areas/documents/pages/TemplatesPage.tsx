import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function TemplatesPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Templates"
				subtitle="Maintain document templates for workflows."
			/>
			<EmptyState
				title="Templates coming soon"
				message="Template management will be available here."
			/>
		</PageContainer>
	);
}
