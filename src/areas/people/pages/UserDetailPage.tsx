import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { LoadingState } from "@/shared/ui/LoadingState";
import { Button } from "@/shared/ui/Button";
import { routes } from "@/shared/lib/routes";
import { OrgUserProfileDialog } from "@/entities/user/components/OrgUserProfileDialog";
import { useCountries } from "@/entities/meta/useCountries";
import { useSubdivisions } from "@/entities/meta/useSubdivisions";
import { formatDate } from "@/shared/lib/format";
import type { OrgUserInfoRowProps } from "@/entities/user/types";
import { Badge } from "@/shared/ui/badge";
import { normalizeDisplay } from "@/shared/lib/utils";
import { useSelfContext } from "@/auth/hooks";
import { useAuth } from "@/auth/hooks";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { usePermissions } from "@/auth/hooks";
import { useOrgUserDetail } from "@/entities/user/hooks";
import { useDepartmentsList, useUpdateUserDepartment } from "@/entities/department/hooks";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";

export function UserDetailPage() {
	const { membershipId } = useParams<{ membershipId: string }>();

	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const { can } = usePermissions();

	const { data, isLoading, refetch } = useOrgUserDetail(membershipId ?? null);

	const [profileDialogOpen, setProfileDialogOpen] = useState(false);
	const { data: countries } = useCountries();
	const countryCode = data?.user.country || "";
	const { data: subdivisions } = useSubdivisions(countryCode || null);
	const { data: selfContext } = useSelfContext();
	const { user: authUser } = useAuth();
	const { data: departmentsData, isLoading: isDepartmentsLoading } =
		useDepartmentsList(
			{ page: 1, page_size: 100 },
			{ staleTime: 5 * 60 * 1000 }
		);

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

	const departmentMutation = useUpdateUserDepartment(data?.membership.id ?? "", {
		onSuccess: () => {
			toast({
				title: "Department updated",
				description: "User department assignment saved.",
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

			<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
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
								<h3 className="text-sm font-semibold">Department assignment</h3>
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
										Department can be assigned when employment and platform are
										Active and you have department.manage.
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
