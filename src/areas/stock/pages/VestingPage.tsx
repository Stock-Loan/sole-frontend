import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function VestingPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Vesting"
				subtitle="Review vesting schedules and eligibility controls."
			/>
			<EmptyState
				title="Vesting insights coming soon"
				message="Vesting analytics and schedules will show here once connected."
			/>
		</PageContainer>
	);
}
