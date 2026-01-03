import { useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";
import { getOrgUser } from "../api/orgUsers.api";
import { OrgUserProfileDialog } from "../components/OrgUserProfileDialog";
import { useCountries } from "@/features/meta/hooks/useCountries";
import { useSubdivisions } from "@/features/meta/hooks/useSubdivisions";
import { formatDate } from "@/lib/format";
import type {
	OrgUserDetailTabKey,
	OrgUserInfoRowProps,
	OrgUserListItem,
} from "../types";
import { Badge } from "@/components/ui/badge";
import { normalizeDisplay } from "@/lib/utils";
import { useSelfContext } from "@/features/auth/hooks/useSelfContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import {
	listDepartments,
	assignDepartmentToUsers,
	unassignDepartments,
} from "@/features/departments/api/departments.api";
import { StockGrantsSection } from "@/features/stock/components/StockGrantsSection";
import { getStockSummary } from "@/features/stock/api/stock.api";
import type { StockGrantsSectionHandle, StockSummary } from "@/features/stock/types";
import { TabButton } from "@/components/common/TabButton";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

export function OrgUserDetailPage() {
	const { membershipId } = useParams<{ membershipId: string }>();

	const queryClient = useQueryClient();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const { can } = usePermissions();

	const { data, isLoading, refetch } = useQuery<OrgUserListItem>({
		enabled: Boolean(membershipId),
		queryKey: queryKeys.orgUsers.detail(membershipId || ""),
		queryFn: () => getOrgUser(membershipId || ""),
	});

	const [profileDialogOpen, setProfileDialogOpen] = useState(false);
	const [tab, setTab] = useState<OrgUserDetailTabKey>("info");
	const grantsRef = useRef<StockGrantsSectionHandle>(null);
	const { data: countries } = useCountries();
	const countryCode = data?.user.country || "";
	const { data: subdivisions } = useSubdivisions(countryCode || null);
	const { data: selfContext } = useSelfContext();
	const { user: authUser } = useAuth();
	const { data: departmentsData, isLoading: isDepartmentsLoading } = useQuery({
		queryKey: queryKeys.departments.list({ page: 1, page_size: 100 }),
		queryFn: () => listDepartments({ page: 1, page_size: 100 }),
		staleTime: 5 * 60 * 1000,
	});
	const canViewStockSummary = can([
		"stock.vesting.view",
		"stock.eligibility.view",
	]);
	const stockSummaryQuery = useQuery<StockSummary>({
		enabled: Boolean(membershipId) && canViewStockSummary,
		queryKey: queryKeys.stock.summary(membershipId || ""),
		queryFn: () => getStockSummary(membershipId || ""),
		placeholderData: (previous) => previous,
	});

	const assignedRoles = useMemo(() => data?.roles ?? [], [data?.roles]);

	// Derive role names for display, merging self-context roles if viewing own profile
	const assignedRoleNames = useMemo(() => {
		const names = assignedRoles.map((r) => r.name);
		if (authUser?.id === data?.user.id && selfContext?.roles) {
			const selfNames = selfContext.roles.map((r) => r.name);
			return Array.from(new Set([...names, ...selfNames])).sort();
		}
		return names.sort();
	}, [assignedRoles, authUser?.id, data?.user.id, selfContext]);
	const departmentOptions = useMemo(
		() => (departmentsData?.items ?? []).filter((dept) => !dept.is_archived),
		[departmentsData?.items]
	);

	const departmentMutation = useMutation({
		mutationFn: async (departmentId: string | null) => {
			if (!data) return;
			if (departmentId) {
				return assignDepartmentToUsers(departmentId, [data.membership.id]);
			}
			return unassignDepartments([data.membership.id]);
		},
		onSuccess: () => {
			toast({
				title: "Department updated",
				description: "User department assignment saved.",
			});
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) &&
					(query.queryKey[0] === "org-users" ||
						query.queryKey[0] === "departments"),
			});
			refetch();
		},
		onError: (err) =>
			apiErrorToast(err, "Unable to update department. Please try again."),
	});

	const infoItems = useMemo(() => {
		if (!data) return [];
		const countryName =
			countries?.find((c) => c.code === data.user.country)?.name ||
			data.user.country;
		const subdivisionName =
			subdivisions?.find((s) => s.code === data.user.state)?.name ||
			data.user.state;
		const orgName = (data.user.org_name || data.user.org_id || "").trim();

		const displayOrgName =
			orgName.length > 0 ? orgName.replace(/^\w/, (c) => c.toUpperCase()) : "";

		return [
			{ label: "User ID", value: data.user.id },
			{ label: "Organization", value: displayOrgName || "—" },
			{ label: "Email", value: data.user.email },
			{ label: "First name", value: data.user.first_name },
			{ label: "Middle name", value: data.user.middle_name },
			{ label: "Last name", value: data.user.last_name },
			{ label: "Preferred name", value: data.user.preferred_name },
			{ label: "Timezone", value: data.user.timezone },
			{ label: "Phone number", value: data.user.phone_number },
			{ label: "Employee ID", value: data.membership.employee_id },
			{
				label: "Department",
				value: data.membership.department_name ?? data.membership.department,
			},
			{
				label: "Employment start date",
				value: formatDate(data.membership.employment_start_date),
			},
			{ label: "Marital status", value: data.user.marital_status },
			{ label: "Country", value: countryName },
			{ label: "State", value: subdivisionName },
			{ label: "Address line 1", value: data.user.address_line1 },
			{ label: "Address line 2", value: data.user.address_line2 },
			{ label: "Postal code", value: data.user.postal_code },
			{ label: "Employment status", value: data.membership.employment_status },
			{ label: "Platform status", value: data.membership.platform_status },
			{ label: "Invitation status", value: data.membership.invitation_status },
			{ label: "Invited at", value: formatDate(data.membership.invited_at) },
			{ label: "Accepted at", value: formatDate(data.membership.accepted_at) },
			{ label: "Created at", value: formatDate(data.membership.created_at) },
		];
	}, [data, countries, subdivisions]);

	if (isLoading) {
		return (
			<PageContainer>
				<LoadingState label="Loading user..." />
			</PageContainer>
		);
	}

	if (!data) {
		return (
			<PageContainer>
				<EmptyState
					title="User not found"
					message="We couldn't load this user. Please retry or return to the list."
					actionLabel="Retry"
					onRetry={refetch}
				/>
			</PageContainer>
		);
	}

	const displayName =
		data.user.full_name ||
		[data.user.first_name, data.user.last_name]
			.filter(Boolean)
			.join(" ")
			.trim() ||
		data.user.email;

	const statusChips = [
		{ label: "Employment", value: data.membership.employment_status },
		{ label: "Platform", value: data.membership.platform_status },
		data.membership.invitation_status
			? { label: "Invitation", value: data.membership.invitation_status }
			: null,
	].filter(Boolean) as { label: string; value?: string | null }[];

	const platformStatus = (data.membership.platform_status || "").toUpperCase();
	const employmentStatus = (
		data.membership.employment_status || ""
	).toUpperCase();
	const canManageDepartments =
		can(["department.manage", "user.manage"]) ||
		Boolean(authUser?.is_superuser);
	const canViewStockGrants =
		can("stock.grant.view") || can("stock.grant.manage");
	const canManageStockGrants = can("stock.grant.manage");
	const grantEligibility =
		stockSummaryQuery.data?.eligibility_result?.eligible_to_exercise;
	const isGrantActionBlocked =
		grantEligibility === false ||
		(canViewStockSummary &&
			(stockSummaryQuery.isLoading || stockSummaryQuery.isFetching));
	const departmentAssignmentDisabled =
		!canManageDepartments ||
		employmentStatus !== "ACTIVE" ||
		platformStatus !== "ACTIVE";
	const currentDepartmentId = data.membership.department_id || "";

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title={displayName}
				subtitle="User profile and access"
				actions={
					<Button asChild variant="outline" size="sm">
						<Link to={routes.users}>Back to users</Link>
					</Button>
				}
			/>

			<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
				<TabButton
					label="User Information"
					value="info"
					active={tab === "info"}
					onSelect={setTab}
				/>
				<TabButton
					label="Stock Grants"
					value="grants"
					active={tab === "grants"}
					onSelect={setTab}
				/>
			</div>

			<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
				{tab === "info" ? (
					<div className="flex min-h-0 flex-1 flex-col">
						<div className="border-b border-border/70 px-6 py-4">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="space-y-1">
									<h2 className="text-lg font-semibold">User Information</h2>
									<p className="text-sm text-muted-foreground">
										Contact, employment, and access details.
									</p>
								</div>
								<Button
									size="sm"
									variant="outline"
									disabled={!can("user.manage")}
									onClick={() => setProfileDialogOpen(true)}
								>
									Edit profile
								</Button>
							</div>
							<div className="mt-3 flex flex-wrap items-center gap-2">
								{statusChips.map((chip) => (
									<Badge key={chip.label} variant="secondary">
										{chip.label}: {chip.value || "—"}
									</Badge>
								))}
							</div>
							<div className="mt-3 flex flex-wrap items-center gap-2">
								{assignedRoleNames.length ? (
									assignedRoleNames.map((role) => (
										<Badge key={role} variant="outline">
											{role}
										</Badge>
									))
								) : (
									<Badge variant="outline">No roles assigned</Badge>
								)}
							</div>
						</div>
						<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-4">
							<section className="space-y-3 rounded-lg border border-border/60 bg-card/50 p-4">
								<div className="flex items-center justify-between">
									<h3 className="text-sm font-semibold">
										Department assignment
									</h3>
									{isDepartmentsLoading ? (
										<span className="text-xs text-muted-foreground">
											Loading…
										</span>
									) : null}
								</div>
								<div className="flex flex-wrap items-center gap-3">
									<Select
										value={currentDepartmentId}
										disabled={
											departmentAssignmentDisabled ||
											isDepartmentsLoading ||
											departmentMutation.isPending
										}
										onValueChange={(val) =>
											departmentMutation.mutate(val === "none" ? null : val)
										}
									>
										<SelectTrigger className="w-[240px] max-w-xs">
											<SelectValue placeholder="Select department" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="none">No department</SelectItem>
											{departmentOptions.map((dept) => (
												<SelectItem key={dept.id} value={dept.id}>
													{dept.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{departmentAssignmentDisabled ? (
										<span className="text-xs text-muted-foreground">
											Department can be assigned when employment and platform
											are Active and you have department.manage.
										</span>
									) : null}
									{departmentMutation.isPending ? (
										<span className="text-xs text-muted-foreground">
											Updating…
										</span>
									) : null}
								</div>
							</section>

							<section className="space-y-2">
								<p className="text-sm font-semibold text-foreground">Contact</p>
								<div className="grid gap-3 md:grid-cols-3">
									{infoItems.slice(0, 9).map((item) => (
										<InfoRow
											key={item.label}
											label={item.label}
											value={item.value}
										/>
									))}
								</div>
							</section>

							<section className="space-y-2">
								<p className="text-sm font-semibold text-foreground">
									Employment & Access
								</p>
								<div className="grid gap-3 md:grid-cols-3">
									{infoItems.slice(9).map((item) => (
										<InfoRow
											key={item.label}
											label={item.label}
											value={item.value}
										/>
									))}
								</div>
							</section>
						</div>
					</div>
				) : (
					<div className="flex min-h-0 flex-1 flex-col">
						<div className="border-b border-border/70 px-6 py-4">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div>
									<h2 className="text-lg font-semibold">Grants</h2>
									<p className="text-sm text-muted-foreground">
										Manage stock grants and vesting schedules for this employee.
									</p>
								</div>
								{canManageStockGrants ? (
									<Button
										size="sm"
										onClick={() => grantsRef.current?.openCreate()}
										disabled={isGrantActionBlocked}
										title={
											isGrantActionBlocked
												? stockSummaryQuery.isLoading ||
												  stockSummaryQuery.isFetching
													? "Checking eligibility…"
													: "This employee is not eligible to exercise shares."
												: undefined
										}
									>
										New grant
									</Button>
								) : null}
							</div>
						</div>
						<div className="flex min-h-0 flex-1 flex-col px-6 py-4">
							{canViewStockGrants ? (
								<StockGrantsSection
									key={data.membership.id}
									ref={grantsRef}
									membershipId={data.membership.id}
									canManage={canManageStockGrants}
								/>
							) : (
								<p className="text-sm text-muted-foreground">
									You do not have access to view stock grants for this user.
								</p>
							)}
						</div>
					</div>
				)}
			</div>

			<OrgUserProfileDialog
				open={profileDialogOpen}
				onOpenChange={setProfileDialogOpen}
				user={data}
				membershipId={data.membership.id}
				onUpdated={() => refetch()}
			/>
		</PageContainer>
	);
}

function InfoRow({ label, value }: OrgUserInfoRowProps) {
	const displayValue = normalizeDisplay(value);

	return (
		<div className="rounded-lg px-4 py-3">
			<p className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="mt-1 break-words text-sm text-foreground">{displayValue}</p>
		</div>
	);
}
