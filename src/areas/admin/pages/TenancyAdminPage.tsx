import { useMemo, useState } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import { Building2, Plus } from "lucide-react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type {
	ColumnDefinition,
	DataTablePreferencesConfig,
} from "@/shared/ui/Table/types";
import { useToast } from "@/shared/ui/use-toast";
import { useSelfContext } from "@/auth/hooks/hooks";
import { OrgCreateForm } from "@/entities/org/components/OrgCreateForm";
import { useCreateOrg } from "@/entities/org/hooks";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import type { OrgRecord, OrgSummary } from "@/entities/org/types";
import { useTenant } from "@/features/tenancy/hooks";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/shared/ui/Dialog/dialog";
import { Button } from "@/shared/ui/Button";

export function TenancyAdminPage() {
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const { orgs, setOrgs } = useTenant();
	const { data: selfContext } = useSelfContext();
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const formId = "create-org-form";
	const isMultiTenant = selfContext?.tenancy_mode === "multi";
	const createOrgMutation = useCreateOrg({
		onSuccess: (created) => {
			const exists = orgs.some((org) => org.id === created.id);
			if (!exists) {
				setOrgs([mapOrgRecordToSummary(created), ...orgs]);
			}
			setIsDialogOpen(false);
			toast({ title: "Organization created" });
		},
		onError: (error) => apiErrorToast(error, "Unable to create org."),
	});

	const columns = useMemo<ColumnDefinition<OrgSummary>[]>(
		() => [
			{
				id: "name",
				header: "Organization",
				accessor: (row) => row.name,
				cell: (row) => (
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
							<Building2 className="h-4 w-4" aria-hidden="true" />
						</div>
						<div className="flex flex-col">
							<span className="text-sm font-semibold text-foreground">
								{row.name}
							</span>
							<span className="text-xs text-muted-foreground">{row.id}</span>
						</div>
					</div>
				),
				enableSorting: true,
			},
			{
				id: "slug",
				header: "Slug",
				accessor: (row) => row.slug ?? "—",
				cell: (row) => (
					<span className="text-sm text-muted-foreground">
						{row.slug ?? "—"}
					</span>
				),
				enableSorting: false,
			},
			{
				id: "status",
				header: "Status",
				accessor: (row) => row.status ?? "active",
				cell: (row) => (
					<span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
						{row.status ?? "active"}
					</span>
				),
				enableSorting: false,
			},
		],
		[],
	);

	const initialColumnVisibility = useMemo<VisibilityState>(
		() => ({
			id: true,
		}),
		[],
	);

	const preferencesConfig = useMemo<DataTablePreferencesConfig>(
		() => ({
			id: "tenancy-admin-orgs",
			scope: "user",
			storage: "local",
			persistPageIndex: true,
			version: 1,
		}),
		[],
	);

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Tenancy admin"
				subtitle="Manage organizations and tenant configuration."
			/>
			<DataTable
				data={orgs}
				columns={columns}
				getRowId={(item) => item.id}
				isLoading={false}
				emptyMessage="No organizations available."
				className="flex-1 min-h-0"
				initialColumnVisibility={initialColumnVisibility}
				preferences={preferencesConfig}
				headerActions={
					isMultiTenant
						? {
								primaryAction: {
									label: "Create org",
									onClick: () => setIsDialogOpen(true),
									icon: Plus,
								},
							}
						: undefined
				}
			/>

			{isMultiTenant && (
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogContent size="sm">
						<DialogHeader>
							<DialogTitle>Create organization</DialogTitle>
							<DialogDescription>
								Add a new organization to the SOLE platform.
							</DialogDescription>
						</DialogHeader>
						<DialogBody>
							<OrgCreateForm
								onSubmit={async (values) => {
									await createOrgMutation.mutateAsync(values);
								}}
								isSubmitting={createOrgMutation.isPending}
								formId={formId}
							/>
						</DialogBody>
						<DialogFooter>
							<Button
								variant="outline"
								onClick={() => setIsDialogOpen(false)}
								disabled={createOrgMutation.isPending}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								form={formId}
								disabled={createOrgMutation.isPending}
							>
								{createOrgMutation.isPending ? "Creating..." : "Create org"}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			)}
		</PageContainer>
	);
}

function mapOrgRecordToSummary(created: OrgRecord): OrgSummary {
	const status = created.status.toLowerCase() as OrgSummary["status"];
	return {
		id: created.id,
		name: created.name,
		slug: created.slug,
		status,
	};
}
