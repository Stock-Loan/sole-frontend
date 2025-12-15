import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { SideModal } from "@/components/ui/side-modal";
import { toast } from "@/components/ui/use-toast";
import { queryKeys } from "@/lib/queryKeys";
import { formatDate } from "@/lib/format";
import { getOrgUser } from "../api/orgUsers.api";
import { listRoles } from "@/features/roles/api/roles.api";
import { OrgUserProfileDialog } from "./OrgUserProfileDialog";
import type { OrgUserListItem, OrgUserSidePanelProps } from "../types";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { normalizeDisplay } from "@/lib/utils";

export function OrgUserSidePanel({
	membershipId,
	open,
	onOpenChange,
	onUpdated = () => undefined,
}: OrgUserSidePanelProps) {
	const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
	const enabled = open && Boolean(membershipId);
	const detailKey = useMemo(
		() => queryKeys.orgUsers.detail(membershipId || "pending"),
		[membershipId]
	);
	const { can } = usePermissions();
	const canManageUsers = can("user.manage");

	const {
		data: user,
		isLoading,
		isError,
	} = useQuery<OrgUserListItem, Error, OrgUserListItem>({
		enabled,
		queryKey: detailKey,
		queryFn: () => getOrgUser(membershipId || ""),
	});
	const { data: rolesData } = useQuery({
		queryKey: queryKeys.roles.list(),
		queryFn: listRoles,
		staleTime: 5 * 60 * 1000,
	});

	useEffect(() => {
		if (!isError) return;
		toast({
			variant: "destructive",
			title: "Failed to load user",
			description: "Unable to fetch this user right now. Please try again.",
		});
	}, [isError]);

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
						value:
							rolesData?.items
								.filter((role) =>
									(user.membership.roles ?? user.membership.role_ids ?? []).includes(
										role.id
									)
								)
								.map((role) => role.name)
								.join(", ") || "—",
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
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Loading user…
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

function InfoGrid({
	items,
}: {
	items: { label: string; value?: string | null }[];
}) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{items.map((item) => (
				<InfoRow key={item.label} label={item.label} value={item.value} />
			))}
		</div>
	);
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
	const displayValue = normalizeDisplay(value);

	return (
		<div className="space-y-1 px-3 py-2">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="break-words text-sm text-foreground">
				{displayValue}
			</p>
		</div>
	);
}
