import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";
import { getOrgUser } from "../api/orgUsers.api";
import { UserRoleAssignments } from "@/features/roles/components/UserRoleAssignments";
import { OrgUserProfileDialog } from "../components/OrgUserProfileDialog";
import { useCountries } from "@/features/meta/hooks/useCountries";
import { useSubdivisions } from "@/features/meta/hooks/useSubdivisions";
import { formatDate } from "@/lib/format";
import type { OrgUserListItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { normalizeDisplay } from "@/lib/utils";
import { getSelfContextRoleIds } from "../utils";
import { useSelfContext } from "@/features/auth/hooks/useSelfContext";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useApiErrorToast } from "@/hooks/useApiErrorToast";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { listDepartments, assignDepartmentToUsers, unassignDepartments } from "@/features/departments/api/departments.api";
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

	const [rolesDialogOpen, setRolesDialogOpen] = useState(false);
	const [profileDialogOpen, setProfileDialogOpen] = useState(false);
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

	const assignedRoles = data?.roles ?? [];

	// Derive role names for display, merging self-context roles if viewing own profile
	const assignedRoleNames = useMemo(() => {
		const names = assignedRoles.map((r) => r.name);
		if (authUser?.id === data?.user.id && selfContext?.roles) {
			const selfNames = selfContext.roles.map((r) => r.name);
			return Array.from(new Set([...names, ...selfNames])).sort();
		}
		return names.sort();
	}, [assignedRoles, authUser?.id, data?.user.id, selfContext?.roles]);

	const assignedRoleIds = useMemo(
		() => assignedRoles.map((r) => r.id),
		[assignedRoles]
	);
	const selfRoleIds =
		authUser?.id === data?.user.id ? getSelfContextRoleIds(selfContext) : [];
	const combinedRoleIds = Array.from(
		new Set([...assignedRoleIds, ...selfRoleIds])
	);
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
	const roleAssignmentDisabled = employmentStatus !== "ACTIVE";
	const roleDisableReason =
		"Role assignment is only available when employment status is Active.";
	const canManageRoles =
		can(["role.manage", "user.manage"]) || Boolean(authUser?.is_superuser);
	const canManageDepartments =
		can(["department.manage", "user.manage"]) || Boolean(authUser?.is_superuser);
	const departmentAssignmentDisabled =
		!canManageDepartments ||
		employmentStatus !== "ACTIVE" ||
		platformStatus !== "ACTIVE";
	const currentDepartmentId = data.membership.department_id || "";

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title={displayName}
				subtitle="User profile and access"
				actions={
					<div className="flex flex-wrap items-center gap-3">
						<Button
							variant="secondary"
							size="sm"
							onClick={() => refetch()}
							disabled={isLoading}
						>
							Refresh
						</Button>
						<Button
							size="sm"
							variant="default"
							disabled={!canManageRoles}
							onClick={() => setRolesDialogOpen(true)}
						>
							Manage roles
						</Button>
						<Button
							size="sm"
							variant="outline"
							disabled={!can("user.manage")}
							onClick={() => setProfileDialogOpen(true)}
						>
							Edit profile
						</Button>
						<Button asChild variant="outline" size="sm">
							<Link to={routes.users}>Back to users</Link>
						</Button>
					</div>
				}
			/>

			<div className="flex flex-wrap items-center gap-2">
				{statusChips.map((chip) => (
					<Badge key={chip.label} variant="secondary">
						{chip.label}: {chip.value || "—"}
					</Badge>
				))}
				{assignedRoleNames.length ? (
					<div className="flex flex-wrap items-center gap-2">
						{assignedRoleNames.map((role) => (
							<Badge key={role} variant="outline">
								{role}
							</Badge>
						))}
					</div>
				) : (
					<Badge variant="outline">No roles assigned</Badge>
				)}
			</div>

			<div className="space-y-6">
				<section className="space-y-3 rounded-lg border border-border/60 bg-card/50 p-4">
					<div className="flex items-center justify-between">
						<h3 className="text-sm font-semibold">Department assignment</h3>
						{isDepartmentsLoading ? (
							<span className="text-xs text-muted-foreground">Loading…</span>
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
								Department can be assigned when employment and platform are Active
								and you have department.manage.
							</span>
						) : null}
						{departmentMutation.isPending ? (
							<span className="text-xs text-muted-foreground">Updating…</span>
						) : null}
					</div>
				</section>

				<section className="space-y-2">
					<p className="text-sm font-semibold text-foreground">Contact</p>
					<div className="grid gap-3 md:grid-cols-2">
						{infoItems.slice(0, 9).map((item) => (
							<InfoRow key={item.label} label={item.label} value={item.value} />
						))}
					</div>
				</section>

				<section className="space-y-2">
					<p className="text-sm font-semibold text-foreground">
						Employment & Access
					</p>
					<div className="grid gap-3 md:grid-cols-2">
						{infoItems.slice(9).map((item) => (
							<InfoRow key={item.label} label={item.label} value={item.value} />
						))}
					</div>
				</section>
			</div>

			<Dialog open={rolesDialogOpen} onOpenChange={setRolesDialogOpen}>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>Manage roles</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<UserRoleAssignments
							membershipId={data.membership.id}
							assignedRoleIds={combinedRoleIds}
							platformStatus={platformStatus}
							disableAssignments={roleAssignmentDisabled}
							disableReason={roleDisableReason}
							onUpdated={() => {
								refetch();
								setRolesDialogOpen(false);
							}}
						/>
					</DialogBody>
				</DialogContent>
			</Dialog>

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

function InfoRow({ label, value }: { label: string; value?: string | null }) {
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
