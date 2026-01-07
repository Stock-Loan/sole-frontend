import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function WhatIfPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="What-if scenarios"
				subtitle="Model alternate repayment and vesting outcomes."
			/>
			<EmptyState
				title="What-if modeling coming soon"
				message="Scenario planning tools will appear here."
			/>
		</PageContainer>
	);
}
