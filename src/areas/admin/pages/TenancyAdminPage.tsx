import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useToast } from "@/shared/ui/use-toast";
import { OrgCreateForm } from "@/entities/org/components/OrgCreateForm";
import { useCreateOrg } from "@/entities/org/hooks";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";

export function TenancyAdminPage() {
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const createOrgMutation = useCreateOrg({
		onSuccess: () => {
			toast({ title: "Organization created" });
		},
		onError: (error) => apiErrorToast(error, "Unable to create org."),
	});

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Tenancy admin"
				subtitle="Manage organizations and tenant configuration."
			/>
			<OrgCreateForm
				onSubmit={(values) => createOrgMutation.mutateAsync(values)}
				isSubmitting={createOrgMutation.isPending}
			/>
			<EmptyState
				title="More tenancy tools coming soon"
				message="Additional organization management tools will appear here."
			/>
		</PageContainer>
	);
}
