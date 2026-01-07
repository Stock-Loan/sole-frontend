import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function TenancyAdminPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Tenancy admin"
				subtitle="Manage organizations and tenant configuration."
			/>
			<EmptyState
				title="Tenancy admin coming soon"
				message="Organization management will appear here."
			/>
		</PageContainer>
	);
}
