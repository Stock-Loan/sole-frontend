import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { SideModal } from "@/components/ui/side-modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { queryKeys } from "@/lib/queryKeys";
import { getOrgUser, updateOrgUserStatus } from "../api/orgUsers.api";
import type {
	EmploymentStatus,
	OrgUserListItem,
	PlatformStatus,
	UpdateOrgUserStatusPayload,
} from "../types";

interface OrgUserSidePanelProps {
	membershipId: string | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUpdated?: () => void;
}

export function OrgUserSidePanel({
	membershipId,
	open,
	onOpenChange,
	onUpdated,
}: OrgUserSidePanelProps) {
	const queryClient = useQueryClient();
	const [employmentStatus, setEmploymentStatus] =
		useState<EmploymentStatus | null>(null);
	const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(
		null,
	);

	const { data, isLoading } = useQuery<OrgUserListItem>({
		enabled: open && Boolean(membershipId),
		queryKey: membershipId ? queryKeys.orgUsers.detail(membershipId) : [],
		queryFn: () => getOrgUser(membershipId || ""),
		onSuccess: (user) => {
			setEmploymentStatus(normalizeEmploymentStatus(user.membership.employment_status));
			setPlatformStatus(normalizePlatformStatus(user.membership.platform_status));
		},
	});

	const mutation = useMutation({
		mutationFn: (payload: UpdateOrgUserStatusPayload) =>
			updateOrgUserStatus(membershipId || "", payload),
		onSuccess: (updated) => {
			setEmploymentStatus(normalizeEmploymentStatus(updated.membership.employment_status));
			setPlatformStatus(normalizePlatformStatus(updated.membership.platform_status));
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) && query.queryKey[0] === "org-users",
			});
			onUpdated?.();
			toast({
				title: "User updated",
				description: "Membership details were saved.",
			});
		},
		onError: () => {
			toast({
				variant: "destructive",
				title: "Update failed",
				description: "We could not save changes. Please try again.",
			});
		},
	});

	const user = data;
	const handleSave = () => {
		const payload: UpdateOrgUserStatusPayload = {
			employment_status: employmentStatus
				? (employmentStatus.toString().toUpperCase() as EmploymentStatus)
				: undefined,
			platform_status: platformStatus
				? (platformStatus.toString().toUpperCase() as PlatformStatus)
				: undefined,
		};
		if (!payload.employment_status && !payload.platform_status) return;
		mutation.mutate(payload);
	};

	return (
		<SideModal
			open={open}
			onOpenChange={onOpenChange}
			title="Employee Details"
			description="View and manage employee information and status."
			actions={[
				{
					label: mutation.isLoading ? "Saving..." : "Save changes",
					onClick: handleSave,
					loading: mutation.isLoading,
					variant: "default",
				},
			]}
		>
			{isLoading || !user ? (
				<div className="flex items-center gap-2 text-sm text-muted-foreground">
					<Loader2 className="h-4 w-4 animate-spin" />
					Loading user…
				</div>
			) : (
				<div className="space-y-4">
					<InfoGrid
						items={[
							{ label: "User ID", value: user.user.id },
							{ label: "Org ID", value: user.user.org_id },
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
							{ label: "Employment status", value: user.membership.employment_status },
							{ label: "Platform status", value: user.membership.platform_status },
							{ label: "Invitation status", value: user.membership.invitation_status },
							{ label: "Invited at", value: formatDate(user.membership.invited_at) },
							{ label: "Accepted at", value: formatDate(user.membership.accepted_at) },
							{ label: "Created at", value: formatDate(user.membership.created_at) },
						]}
					/>

					<div className="grid gap-4 sm:grid-cols-2">
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Employment status
							</p>
							<Select
								value={employmentStatus ?? undefined}
								onValueChange={(value) =>
									setEmploymentStatus(value as EmploymentStatus)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="ACTIVE">Active</SelectItem>
									<SelectItem value="INACTIVE">Inactive</SelectItem>
									<SelectItem value="LEAVE">Leave</SelectItem>
									<SelectItem value="TERMINATED">Terminated</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								Platform status
							</p>
							<Select
								value={platformStatus ?? undefined}
								onValueChange={(value) =>
									setPlatformStatus(value as PlatformStatus)
								}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="INVITED">Invited</SelectItem>
									<SelectItem value="ENABLED">Enabled</SelectItem>
									<SelectItem value="DISABLED">Disabled</SelectItem>
									<SelectItem value="LOCKED">Locked</SelectItem>
									<SelectItem value="ACTIVE">Active</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</div>
			)}
		</SideModal>
	);
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="space-y-1 rounded-lg border border-border/60 bg-muted/30 px-3 py-2">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="text-sm text-foreground break-words">{value || "—"}</p>
		</div>
	);
}

function InfoGrid({ items }: { items: { label: string; value?: string | null }[] }) {
	return (
		<div className="grid gap-3 sm:grid-cols-2">
			{items.map((item) => (
				<InfoRow key={item.label} label={item.label} value={item.value} />
			))}
		</div>
	);
}

function formatDate(value?: string | null) {
	if (!value) return "—";
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return date.toLocaleDateString();
}

function normalizeEmploymentStatus(status?: EmploymentStatus | null) {
	return status ? (status.toString().toUpperCase() as EmploymentStatus) : null;
}

function normalizePlatformStatus(status?: PlatformStatus | null) {
	return status ? (status.toString().toUpperCase() as PlatformStatus) : null;
}
