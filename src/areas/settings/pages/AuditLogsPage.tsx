import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";

export function AuditLogsPage() {
	return (
		<PageContainer className="space-y-4">
			<PageHeader
				title="Audit logs"
				subtitle="Track admin actions and configuration changes."
			/>
			<EmptyState
				title="Audit logs coming soon"
				message="Audit trail reporting will be available here."
			/>
		</PageContainer>
	);
}
