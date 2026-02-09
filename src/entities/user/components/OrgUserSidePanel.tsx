import { useMemo, useState, useEffect } from "react";
import { SideModal } from "@/shared/ui/Dialog/side-modal";
import { Skeleton } from "@/shared/ui/Skeleton";
import { toast } from "@/shared/ui/use-toast";
import { formatDate } from "@/shared/lib/format";
import { OrgUserProfileDialog } from "./OrgUserProfileDialog";
import type {
	OrgUserInfoGridProps,
	OrgUserInfoRowProps,
	OrgUserSidePanelProps,
} from "../types";
import { normalizeDisplay } from "@/shared/lib/utils";
import { useOrgUserDetail } from "@/entities/user/hooks";

export function OrgUserSidePanel({
	membershipId,
	open,
	onOpenChange,
	onUpdated = () => undefined,
	canManageUsers = false,
	currentUserId,
	selfContextRoleNames = [],
}: OrgUserSidePanelProps) {
	const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
	const enabled = open && Boolean(membershipId);

	const {
		data: user,
		isLoading,
		isError,
	} = useOrgUserDetail(enabled ? membershipId || null : null);

	useEffect(() => {
		if (!isError) return;
		toast({
			variant: "destructive",
			title: "Failed to load user",
			description: "Unable to fetch this user right now. Please try again.",
		});
	}, [isError]);

	const userRolesForDisplay = useMemo(() => {
		if (!user) return "—";
		const baseNames =
			user.roles
				?.map((r) => normalizeDisplay(r.name))
				.filter((name) => name !== "—") ?? [];
		const isSelf = Boolean(currentUserId && currentUserId === user.user.id);
		const selfNames = selfContextRoleNames
			.map((name) => normalizeDisplay(name))
			.filter((name) => name !== "—");
		const combined = isSelf
			? Array.from(
					new Set([...baseNames, ...selfNames]),
				)
			: baseNames;
		return combined.sort().join(", ") || "—";
	}, [user, currentUserId, selfContextRoleNames]);

	const infoItems =
		user?.user && user?.membership
			? [
					{ label: "User ID", value: user.user.id },
					{
						label: "Organization",
						value:
							user.user.org_name?.replace(/^\w/, (c) => c.toUpperCase()) || "—",
					},
					{ label: "Email", value: user.user.email },
					{ label: "First name", value: user.user.first_name },
					{ label: "Middle name", value: user.user.middle_name },
					{ label: "Last name", value: user.user.last_name },
					{ label: "Preferred name", value: user.user.preferred_name },
					{ label: "Timezone", value: user.user.timezone },
					{ label: "Phone number", value: user.user.phone_number },
					{ label: "Employee ID", value: user.membership.employee_id },
					{
						label: "Department",
						value:
							user.membership.department_name ?? user.membership.department,
					},
					{
						label: "Employment start date",
						value: formatDate(user.membership.employment_start_date),
					},
					{ label: "Marital status", value: user.user.marital_status },
					{ label: "Country", value: user.user.country },
					{ label: "State", value: user.user.state },
					{ label: "Address line 1", value: user.user.address_line1 },
					{ label: "Address line 2", value: user.user.address_line2 },
					{ label: "Postal code", value: user.user.postal_code },
					{
						label: "Employment status",
						value: user.membership.employment_status,
					},
					{ label: "Platform status", value: user.membership.platform_status },
					{
						label: "Invitation status",
						value: user.membership.invitation_status,
					},
					{
						label: "Invited at",
						value: formatDate(user.membership.invited_at),
					},
					{
						label: "Accepted at",
						value: formatDate(user.membership.accepted_at),
					},
					{
						label: "Created at",
						value: formatDate(user.membership.created_at),
					},
					{
						label: "Roles",
						value: userRolesForDisplay,
					},
				]
			: [];

	return (
		<>
			<SideModal
				open={open}
				onOpenChange={onOpenChange}
				title="Employee Details"
				description="View and manage employee information and status."
				actions={
					canManageUsers
						? [
								{
									label: "Edit profile",
									onClick: () => setIsProfileDialogOpen(true),
									variant: "outline",
								},
							]
						: []
				}
			>
				{isLoading || !user ? (
					<div className="space-y-3">
						{Array.from({ length: 6 }).map((_, index) => (
							<div
								key={`org-user-side-panel-skeleton-${index}`}
								className="space-y-1"
							>
								<Skeleton className="h-3 w-24" />
								<Skeleton className="h-4 w-48" />
							</div>
						))}
					</div>
				) : (
					<div className="space-y-4">
						<InfoGrid items={infoItems} />
					</div>
				)}
			</SideModal>

			<OrgUserProfileDialog
				open={isProfileDialogOpen}
				onOpenChange={setIsProfileDialogOpen}
				user={user ?? null}
				membershipId={membershipId}
				onUpdated={() => {
					onUpdated();
					setIsProfileDialogOpen(false);
				}}
			/>
		</>
	);
}

function InfoGrid({ items }: OrgUserInfoGridProps) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{items.map((item) => (
				<InfoRow key={item.label} label={item.label} value={item.value} />
			))}
		</div>
	);
}

function InfoRow({ label, value }: OrgUserInfoRowProps) {
	const displayValue = normalizeDisplay(value);

	return (
		<div className="space-y-1 px-3 py-2">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="break-words text-sm text-foreground">{displayValue}</p>
		</div>
	);
}
