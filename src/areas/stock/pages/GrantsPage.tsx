import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function GrantsPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Grants"
				subtitle="Manage equity grants across the organization."
			/>
			<EmptyState
				title="Grant management coming soon"
				message="Grant creation and bulk actions will appear here."
			/>
		</PageContainer>
	);
}
