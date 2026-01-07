import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function PacketsPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Packets"
				subtitle="Bundle documents into reusable packets."
			/>
			<EmptyState
				title="Packets coming soon"
				message="Packet workflows will appear here once configured."
			/>
		</PageContainer>
	);
}
