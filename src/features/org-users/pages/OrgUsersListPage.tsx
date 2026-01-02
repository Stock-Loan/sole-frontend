import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { PaginationState } from "@tanstack/react-table";
import { Link, useSearchParams } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { DataTable } from "@/components/data-table/DataTable";
import type { ColumnDefinition } from "@/components/data-table/types";
import { Badge } from "@/components/ui/badge";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";
import { normalizeDisplay } from "@/lib/utils";
import { listOrgUsers } from "../api/orgUsers.api";
import type { OrgUserListItem, OrgUsersListParams } from "../types";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const PAGE_SIZE_OPTIONS = [10, 20, 30, 40, 50];

function parsePositiveInt(value: string | null, fallback: number) {
	if (!value) return fallback;
	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed) || parsed <= 0) return fallback;
	return parsed;
}

function getDisplayName(user: OrgUserListItem["user"]) {
	return (
		user.full_name ||
		[user.first_name, user.last_name].filter(Boolean).join(" ").trim() ||
		user.email
	);
}

function getDepartmentLabel(membership: OrgUserListItem["membership"]) {
	return (
		membership.department_name ||
		membership.department ||
		membership.department_id ||
		"—"
	);
}

const columns: ColumnDefinition<OrgUserListItem>[] = [
	{
		id: "fullName",
		header: "Full name",
		accessor: (row) => getDisplayName(row.user),
		filterAccessor: (row) =>
			`${getDisplayName(row.user)} ${row.user.email}`.trim(),
		cell: (row) => (
			<Link
				to={routes.userDetail.replace(":membershipId", row.membership.id)}
				className="font-semibold text-primary underline-offset-4 hover:underline"
			>
				{getDisplayName(row.user)}
			</Link>
		),
		headerClassName: "min-w-[200px]",
	},
	{
		id: "employeeId",
		header: "Employee ID",
		accessor: (row) => row.membership.employee_id ?? "",
		cell: (row) => row.membership.employee_id || "—",
	},
	{
		id: "email",
		header: "Email",
		accessor: (row) => row.user.email,
		cell: (row) => row.user.email,
	},
	{
		id: "department",
		header: "Department",
		accessor: (row) => getDepartmentLabel(row.membership),
		cell: (row) => getDepartmentLabel(row.membership),
	},
	{
		id: "employmentStatus",
		header: "Employment status",
		accessor: (row) => row.membership.employment_status ?? "",
		filterAccessor: (row) => row.membership.employment_status ?? "",
		cell: (row) => (
			<Badge variant="outline">
				{normalizeDisplay(row.membership.employment_status)}
			</Badge>
		),
	},
	{
		id: "platformStatus",
		header: "Platform status",
		accessor: (row) => row.membership.platform_status ?? "",
		filterAccessor: (row) => row.membership.platform_status ?? "",
		cell: (row) => (
			<Badge variant="outline">
				{normalizeDisplay(row.membership.platform_status)}
			</Badge>
		),
	},
];

export function OrgUsersListPage() {
	const [searchParams, setSearchParams] = useSearchParams();
	const apiErrorToast = useApiErrorToast();

	const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
	const pageSize = parsePositiveInt(
		searchParams.get("page_size"),
		DEFAULT_PAGE_SIZE
	);

	useEffect(() => {
		const nextParams = new URLSearchParams(searchParams);
		let changed = false;

		if (searchParams.get("page") !== String(page)) {
			nextParams.set("page", String(page));
			changed = true;
		}

		if (searchParams.get("page_size") !== String(pageSize)) {
			nextParams.set("page_size", String(pageSize));
			changed = true;
		}

		if (changed) {
			setSearchParams(nextParams, { replace: true });
		}
	}, [page, pageSize, searchParams, setSearchParams]);

	const listParams = useMemo<OrgUsersListParams>(
		() => ({
			page,
			page_size: pageSize,
		}),
		[page, pageSize]
	);

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: queryKeys.orgUsers.list(listParams),
		queryFn: () => listOrgUsers(listParams),
		placeholderData: (previous) => previous,
	});

	const totalRows = data?.total ?? data?.items.length ?? 0;
	const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

	useEffect(() => {
		if (page <= totalPages) return;
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("page", String(totalPages));
		setSearchParams(nextParams, { replace: true });
	}, [page, searchParams, setSearchParams, totalPages]);

	useEffect(() => {
		if (!isError) return;
		apiErrorToast(error, "Unable to load organization users.");
	}, [apiErrorToast, error, isError]);

	const paginationState = useMemo<PaginationState>(
		() => ({ pageIndex: Math.max(0, page - 1), pageSize }),
		[page, pageSize]
	);

	const handlePaginationChange = (
		updater:
			| PaginationState
			| ((previous: PaginationState) => PaginationState)
	) => {
		const nextState =
			typeof updater === "function" ? updater(paginationState) : updater;
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("page", String(nextState.pageIndex + 1));
		nextParams.set("page_size", String(nextState.pageSize));
		setSearchParams(nextParams);
	};

	return (
		<PageContainer>
			<PageHeader
				title="Org users"
				subtitle="View organization users and core statuses."
			/>
			{isError ? (
				<EmptyState
					title="Unable to load users"
					message="We couldn't load organization users right now. Please try again."
					actionLabel="Retry"
					onRetry={refetch}
				/>
			) : (
				<DataTable
					data={data?.items ?? []}
					columns={columns}
					getRowId={(row) => row.membership.id}
					isLoading={isLoading}
					emptyMessage="No users found for this organization."
					exportFileName="org-users.csv"
					pagination={{
						enabled: true,
						mode: "server",
						state: paginationState,
						onPaginationChange: handlePaginationChange,
						pageCount: totalPages,
						totalRows,
						pageSizeOptions: PAGE_SIZE_OPTIONS,
					}}
				/>
			)}
		</PageContainer>
	);
}
