import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { RefreshCw, Upload, UserPlus } from "lucide-react";
import { isAxiosError } from "axios";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { queryKeys } from "@/lib/queryKeys";
import { Pagination } from "@/components/ui/pagination";
import { AddUserDialog } from "../components/AddUserDialog";
import { OrgUsersFilters } from "../components/OrgUsersFilters";
import { OrgUsersTable } from "../components/OrgUsersTable";
import { OrgUserSidePanel } from "../components/OrgUserSidePanel";
import { listOrgUsers, onboardOrgUser } from "../api/orgUsers.api";
import type {
	EmploymentStatus,
	OrgUsersListParams,
	OrgUsersListResponse,
	OnboardUserPayload,
	PlatformStatus,
} from "../types";

export function OrgUsersListPage() {
	const [searchTerm, setSearchTerm] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [employmentStatus, setEmploymentStatus] = useState<
		EmploymentStatus | "ALL"
	>("ALL");
	const [platformStatus, setPlatformStatus] = useState<PlatformStatus | "ALL">(
		"ALL"
	);
	const [page, setPage] = useState(1);
	const [isAddModalOpen, setIsAddModalOpen] = useState(false);
	const [selectedMembershipId, setSelectedMembershipId] = useState<
		string | null
	>(null);
	const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
		return () => clearTimeout(timer);
	}, [searchTerm]);

	const listParams = useMemo<OrgUsersListParams>(
		() => ({
			search: debouncedSearch || undefined,
			employment_status:
				employmentStatus === "ALL" ? undefined : employmentStatus,
			platform_status: platformStatus === "ALL" ? undefined : platformStatus,
			page,
			page_size: 10,
		}),
		[debouncedSearch, employmentStatus, platformStatus, page]
	);

	const { data, isLoading, isFetching, isError, error, refetch } =
		useQuery<OrgUsersListResponse>({
			queryKey: queryKeys.orgUsers.list(listParams),
			queryFn: () => listOrgUsers(listParams),
			keepPreviousData: true,
		});

	useEffect(() => {
		if (isError) {
			let message = "Unable to load users right now. Please try again.";
			if (isAxiosError(error)) {
				const detail = error.response?.data;
				if (detail && typeof detail === "object" && "detail" in detail) {
					const detailValue = (detail as { detail?: unknown }).detail;
					if (
						typeof detailValue === "string" &&
						detailValue.trim().length > 0
					) {
						message = detailValue;
					}
				} else if (
					typeof error.message === "string" &&
					error.message.length > 0
				) {
					message = error.message;
				}
			}
			toast({
				variant: "destructive",
				title: "Failed to load users",
				description: message,
			});
		}
	}, [error, isError]);

	const handleAddUser = async (values: OnboardUserPayload) => {
		await onboardOrgUser(values);
		toast({
			title: "User onboarded",
			description: "The user has been added to this organization.",
		});
		refetch();
	};

	const handleSearchChange = (value: string) => {
		setSearchTerm(value);
		setPage(1);
	};

	const handleEmploymentChange = (value: EmploymentStatus | "ALL") => {
		setEmploymentStatus(value);
		setPage(1);
	};

	const handlePlatformChange = (value: PlatformStatus | "ALL") => {
		setPlatformStatus(value);
		setPage(1);
	};

	const handleSelectUser = (membershipId: string) => {
		setSelectedMembershipId(membershipId);
		setIsSidePanelOpen(true);
	};

	const total = data?.total;
	const pageSize = data?.page_size ?? listParams.page_size ?? 10;
	const hasNext =
		typeof total === "number"
			? page * pageSize < total
			: (data?.items?.length ?? 0) === pageSize;

	return (
		<div className="space-y-6">
			<PageHeader
				title="Org users"
				subtitle="View organization users and core statuses. Data is scoped to your current organization."
				actions={
					<div className="flex gap-2">
						<AddUserDialog
							open={isAddModalOpen}
							onOpenChange={setIsAddModalOpen}
							onSubmit={handleAddUser}
							trigger={
								<Button variant="outline" size="sm">
									<UserPlus className="mr-2 h-4 w-4" />
									Add user
								</Button>
							}
						/>
						<Button variant="outline" size="sm" asChild>
							<Link to="/app/users/onboard">
								<Upload className="mr-2 h-4 w-4" />
								Bulk onboarding
							</Link>
						</Button>
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							<RefreshCw className="mr-2 h-4 w-4" />
							Refresh
						</Button>
					</div>
				}
			/>

			<OrgUsersFilters
				search={searchTerm}
				onSearchChange={handleSearchChange}
				employmentStatus={employmentStatus}
				onEmploymentChange={handleEmploymentChange}
				platformStatus={platformStatus}
				onPlatformChange={handlePlatformChange}
			/>
			<OrgUsersTable
				items={data?.items ?? []}
				isLoading={isLoading}
				isError={isError}
				isFetching={isFetching}
				onRefresh={() => refetch()}
				onSelect={handleSelectUser}
			/>
			<Pagination
				page={page}
				pageSize={pageSize}
				total={total}
				hasNext={hasNext}
				isLoading={isFetching}
				onPageChange={setPage}
			/>
			<OrgUserSidePanel
				membershipId={selectedMembershipId}
				open={isSidePanelOpen}
				onOpenChange={setIsSidePanelOpen}
				onUpdated={() => refetch()}
			/>
		</div>
	);
}
