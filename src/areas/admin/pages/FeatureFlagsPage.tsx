import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function FeatureFlagsPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Feature flags"
				subtitle="Control feature rollouts and experiments."
			/>
			<EmptyState
				title="Feature flags coming soon"
				message="Flag management will live here once enabled."
			/>
		</PageContainer>
	);
}
