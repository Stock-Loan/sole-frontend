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
	OrgUserDetail,
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
};

function StatusPill({ label }: { label: string }) {
	const tone = badgeTone[label] || "border-border bg-muted/50 text-foreground";
	return (
		<span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold capitalize", tone)}>
			{label}
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

	const { data, isLoading, isError, error } = useQuery({
		enabled: Boolean(membershipId),
		queryKey: membershipId ? queryKeys.orgUsers.detail(membershipId) : [],
		queryFn: () => getOrgUser(membershipId || ""),
		onSuccess: (user) => {
			setEmploymentStatus(user.employmentStatus);
			setPlatformStatus(user.platformStatus);
		},
	});

	const mutation = useMutation({
		mutationFn: (payload: UpdateOrgUserStatusPayload) =>
			updateOrgUserStatus(membershipId || "", payload),
		onSuccess: (updated) => {
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

	const user = data as OrgUserDetail | undefined;
	const name = useMemo(() => {
		if (!user) return "User";
		return (
			user.user.fullName ||
			[user.user.firstName, user.user.lastName].filter(Boolean).join(" ") ||
			user.user.email
		);
	}, [user]);

	const handleSave = () => {
		if (!employmentStatus && !platformStatus) return;
		mutation.mutate({
			employment_status: employmentStatus || undefined,
			platform_status: platformStatus || undefined,
		});
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
								{user.invitationStatus ? (
									<StatusPill label={user.invitationStatus} />
								) : null}
								{user.orgId ? (
									<span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold">
										Org {user.orgId}
									</span>
								) : null}
								{user.lastActiveAt ? (
									<span className="text-[11px]">
										Last active: {new Date(user.lastActiveAt).toLocaleString()}
									</span>
								) : null}
							</div>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid gap-4 md:grid-cols-2">
								<InfoItem label="Employee ID" value={user.employeeId || "—"} />
								<InfoItem
									label="Employment start"
									value={
										user.employmentStartDate
											? new Date(user.employmentStartDate).toLocaleDateString()
											: "—"
									}
								/>
								<InfoItem label="Phone" value={user.phoneNumber || "—"} />
								<InfoItem label="Timezone" value={user.timezone || "—"} />
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
											<SelectItem value="active">Active</SelectItem>
											<SelectItem value="inactive">Inactive</SelectItem>
											<SelectItem value="leave">Leave</SelectItem>
											<SelectItem value="terminated">Terminated</SelectItem>
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
											<SelectItem value="enabled">Enabled</SelectItem>
											<SelectItem value="disabled">Disabled</SelectItem>
											<SelectItem value="locked">Locked</SelectItem>
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
							<InfoItem label="Membership ID" value={user.membershipId} />
							<InfoItem label="Org ID" value={user.orgId} />
							<InfoItem
								label="Roles"
								value={
									user.roles && user.roles.length > 0
										? user.roles.join(", ")
										: "—"
								}
							/>
							<InfoItem
								label="Invitation status"
								value={user.invitationStatus || "—"}
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
