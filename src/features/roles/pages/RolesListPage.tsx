import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { queryKeys } from "@/lib/queryKeys";
import { listRoles } from "../api/roles.api";
import { RolePermissionsDialog } from "../components/RolePermissionsDialog";
import { RolesTable } from "../components/RolesTable";
import type { Role } from "../types";

export function RolesListPage() {
	const apiErrorToast = useApiErrorToast();
	const [selectedRole, setSelectedRole] = useState<Role | null>(null);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const { data, isLoading, isError, isFetching, error, refetch } = useQuery({
		queryKey: queryKeys.roles.list(),
		queryFn: listRoles,
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		if (isError) {
			apiErrorToast(error, "Unable to load roles. Please try again.");
		}
	}, [isError, error, apiErrorToast]);

	const roles = useMemo(() => data?.items ?? [], [data?.items]);

	const handleViewPermissions = (role: Role) => {
		setSelectedRole(role);
		setIsDialogOpen(true);
	};

	const handleDialogChange = (open: boolean) => {
		setIsDialogOpen(open);
		if (!open) {
			setSelectedRole(null);
		}
	};

	return (
		<PageContainer>
			<PageHeader
				title="Roles & permissions"
				subtitle="View system and custom roles with their permission sets."
				actions={
					<Button
						variant="outline"
						size="sm"
						onClick={() => refetch()}
						disabled={isFetching}
					>
						<RefreshCw className="mr-2 h-4 w-4" />
						Refresh
					</Button>
				}
			/>

			<RolesTable
				roles={roles}
				isLoading={isLoading}
				isError={isError}
				isFetching={isFetching}
				onRetry={refetch}
				onViewPermissions={handleViewPermissions}
			/>

			<RolePermissionsDialog
				role={selectedRole}
				open={isDialogOpen}
				onOpenChange={handleDialogChange}
			/>
		</PageContainer>
	);
}
