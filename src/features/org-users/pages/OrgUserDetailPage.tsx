import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, ShieldCheck, User as UserIcon } from "lucide-react";
import { isAxiosError } from "axios";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import { queryKeys } from "@/lib/queryKeys";
import { cn } from "@/lib/utils";
import { getOrgUser, updateOrgUserStatus } from "../api/orgUsers.api";
import type {
	EmploymentStatus,
	OrgUserListItem,
	PlatformStatus,
	UpdateOrgUserStatusPayload,
} from "../types";

const badgeTone: Record<string, string> = {
	active: "border-emerald-200 bg-emerald-50 text-emerald-700",
	inactive: "border-slate-200 bg-slate-50 text-slate-700",
	terminated: "border-rose-200 bg-rose-50 text-rose-700",
	leave: "border-amber-200 bg-amber-50 text-amber-700",
	enabled: "border-emerald-200 bg-emerald-50 text-emerald-700",
	disabled: "border-slate-200 bg-slate-50 text-slate-700",
	locked: "border-amber-200 bg-amber-50 text-amber-700",
	pending: "border-amber-200 bg-amber-50 text-amber-700",
	accepted: "border-emerald-200 bg-emerald-50 text-emerald-700",
	expired: "border-rose-200 bg-rose-50 text-rose-700",
	invited: "border-amber-200 bg-amber-50 text-amber-700",
};

function StatusPill({ label }: { label: string }) {
	const normalized = (label || "").toLowerCase();
	const tone = badgeTone[normalized] || "border-border bg-muted/50 text-foreground";
	const displayLabel = (label || "")
		.replace(/_/g, " ")
		.toLowerCase()
		.replace(/^\w/, (c) => c.toUpperCase());
	return (
		<span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize", tone)}>
			{displayLabel}
		</span>
	);
}

export function OrgUserDetailPage() {
	const { membershipId } = useParams<{ membershipId: string }>();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [employmentStatus, setEmploymentStatus] =
		useState<EmploymentStatus | null>(null);
	const [platformStatus, setPlatformStatus] = useState<PlatformStatus | null>(
		null,
	);

	const normalizeEmploymentStatus = (status?: EmploymentStatus | null) =>
		status ? (status.toString().toUpperCase() as EmploymentStatus) : null;
	const normalizePlatformStatus = (status?: PlatformStatus | null) =>
		status ? (status.toString().toUpperCase() as PlatformStatus) : null;

	const { data, isLoading, isError } = useQuery<OrgUserListItem>({
		enabled: Boolean(membershipId),
		queryKey: membershipId ? queryKeys.orgUsers.detail(membershipId) : [],
		queryFn: () => getOrgUser(membershipId || ""),
		onSuccess: (user) => {
			setEmploymentStatus(
				normalizeEmploymentStatus(user.membership.employment_status),
			);
			setPlatformStatus(
				normalizePlatformStatus(user.membership.platform_status),
			);
		},
	});

	const mutation = useMutation({
		mutationFn: (payload: UpdateOrgUserStatusPayload) =>
			updateOrgUserStatus(membershipId || "", payload),
		onSuccess: (updated) => {
			setEmploymentStatus(
				normalizeEmploymentStatus(updated.membership.employment_status),
			);
			setPlatformStatus(
				normalizePlatformStatus(updated.membership.platform_status),
			);
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey) && query.queryKey[0] === "org-users",
			});
			queryClient.setQueryData(
				queryKeys.orgUsers.detail(membershipId || ""),
				updated,
			);
			toast({
				title: "Statuses updated",
				description: "Employment and platform statuses were saved.",
			});
		},
		onError: (err) => {
			let description = "Could not update user statuses. Please try again.";
			if (isAxiosError(err)) {
				const detail = err.response?.data;
				if (detail && typeof detail === "object" && "detail" in detail) {
					const value = (detail as { detail?: unknown }).detail;
					if (typeof value === "string" && value.trim().length > 0) {
						description = value;
					}
				} else if (err.message) {
					description = err.message;
				}
			}
			toast({
				variant: "destructive",
				title: "Update failed",
				description,
			});
		},
	});

	const user = data as OrgUserListItem | undefined;
	const name = useMemo(() => {
		if (!user) return "User";
		return (
			user.user.full_name ||
			[user.user.first_name, user.user.last_name].filter(Boolean).join(" ") ||
			user.user.email
		);
	}, [user]);

	const toEmploymentStatus = (status?: EmploymentStatus | null) =>
		status ? (status.toString().toUpperCase() as EmploymentStatus) : undefined;

	const toPlatformStatus = (status?: PlatformStatus | null) =>
		status ? (status.toString().toUpperCase() as PlatformStatus) : undefined;

	const handleSave = () => {
		const payload: UpdateOrgUserStatusPayload = {
			employment_status: toEmploymentStatus(employmentStatus),
			platform_status: toPlatformStatus(platformStatus),
		};
		if (!payload.employment_status && !payload.platform_status) return;
		mutation.mutate(payload);
	};

	const loadingContent = (
		<div className="flex items-center gap-2 text-sm text-muted-foreground">
			<Loader2 className="h-4 w-4 animate-spin" />
			Loading user details…
		</div>
	);

	const errorContent = (
		<Card>
			<CardContent className="space-y-3 p-6">
				<p className="text-sm text-destructive">
					Unable to load this user. Please try again.
				</p>
				<Button variant="outline" size="sm" onClick={() => navigate(-1)}>
					Go back
				</Button>
			</CardContent>
		</Card>
	);

	return (
		<div className="space-y-6">
			<PageHeader
				title="User detail"
				subtitle="View org membership and manage statuses."
				actions={
					<Button variant="outline" size="sm" onClick={() => navigate(-1)}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Back
					</Button>
				}
			/>
			{isLoading ? (
				loadingContent
			) : isError || !user ? (
				errorContent
			) : (
				<div className="grid gap-4 lg:grid-cols-3">
					<Card className="lg:col-span-2">
						<CardHeader className="flex flex-col gap-2">
							<div className="flex items-center gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<UserIcon className="h-5 w-5" />
								</div>
								<div className="flex flex-col">
									<CardTitle className="text-xl">{name}</CardTitle>
									<CardDescription>{user.user.email}</CardDescription>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
								{user.membership.invitation_status ? (
									<StatusPill label={user.membership.invitation_status} />
								) : null}
								{user.membership.org_id ? (
									<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
										Org {user.membership.org_id}
									</span>
								) : null}
								{user.membership.last_active_at ? (
									<span className="text-[11px]">
										Last active:{" "}
										{new Date(
											user.membership.last_active_at
										).toLocaleString()}
									</span>
								) : null}
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<InfoItem
									label="Employee ID"
									value={user.membership.employee_id || "—"}
								/>
								<InfoItem
									label="Employment start"
									value={
										user.membership.employment_start_date
											? new Date(
													user.membership.employment_start_date
											  ).toLocaleDateString()
											: "—"
									}
								/>
								<InfoItem
									label="Phone"
									value={user.user.phone_number || "—"}
								/>
								<InfoItem label="Timezone" value={user.user.timezone || "—"} />
							</div>
							<Separator />
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label>Employment status</Label>
									<Select
										value={employmentStatus ?? undefined}
										onValueChange={(value) =>
											setEmploymentStatus(value as EmploymentStatus)
										}
									>
										<SelectTrigger>
											<SelectValue />
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
									<Label>Platform status</Label>
									<Select
										value={platformStatus ?? undefined}
										onValueChange={(value) =>
											setPlatformStatus(value as PlatformStatus)
										}
									>
										<SelectTrigger>
											<SelectValue />
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
							<div className="flex justify-end">
								<Button
									onClick={handleSave}
									disabled={mutation.isLoading}
									className="inline-flex items-center gap-2"
								>
									{mutation.isLoading ? (
										<Loader2 className="h-4 w-4 animate-spin" />
									) : (
										<ShieldCheck className="h-4 w-4" />
									)}
									Save changes
								</Button>
							</div>
						</CardContent>
					</Card>
					<Card>
						<CardHeader>
							<CardTitle>Membership</CardTitle>
							<CardDescription>
								Organization-specific membership attributes.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							<InfoItem label="Membership ID" value={user.membership.id} />
							<InfoItem label="Org ID" value={user.membership.org_id} />
							<InfoItem
								label="Roles"
								value={
									user.membership.roles && user.membership.roles.length > 0
										? user.membership.roles.join(", ")
										: "—"
								}
							/>
							<InfoItem
								label="Invitation status"
								value={user.membership.invitation_status || "—"}
							/>
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}

function InfoItem({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="text-sm text-foreground">{value}</p>
		</div>
	);
}
