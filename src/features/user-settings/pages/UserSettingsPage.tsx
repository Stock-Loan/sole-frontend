import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldOff, UserCircle2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { queryKeys } from "@/lib/queryKeys";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { getUserSettings } from "@/features/user-settings/api/userSettings.api";
import { listOrgUsers } from "@/features/org-users/api/orgUsers.api";
import type { OrgUserListItem } from "@/features/org-users/types";
import type {
	UserSettingsInfoCardProps,
	UserSettingsProfile,
	UserSettingsSectionGridProps,
	UserSettingsTabButtonProps,
	UserSettingsTabKey,
} from "../types";

export function UserSettingsPage() {
	const { user: cachedUser } = useAuth();
	const [tab, setTab] = useState<UserSettingsTabKey>("profile");

	const { data, isLoading, isError } = useQuery<UserSettingsProfile>({
		queryKey: queryKeys.auth.me(),
		queryFn: () => getUserSettings(),
		staleTime: 5 * 60 * 1000,
	});

	const currentEmail = data?.email || cachedUser?.email || "";

	const { data: orgUser } = useQuery<OrgUserListItem | null>({
		enabled: Boolean(currentEmail),
		queryKey: queryKeys.orgUsers.currentUser(currentEmail),
		queryFn: async () => {
			const response = await listOrgUsers({
				search: currentEmail,
				page: 1,
				page_size: 5,
			});
			return (
				response.items?.find((item) => item.user.email === currentEmail) ?? null
			);
		},
		staleTime: 5 * 60 * 1000,
	});

	const user = data ?? cachedUser;

	const personalItems = [
		{ label: "First name", value: orgUser?.user.first_name || "—" },
		{ label: "Middle name", value: orgUser?.user.middle_name || "—" },
		{ label: "Last name", value: orgUser?.user.last_name || "—" },
		{ label: "Preferred name", value: orgUser?.user.preferred_name || "—" },
		{ label: "Email", value: orgUser?.user.email || user?.email || "—" },
		{ label: "Phone number", value: orgUser?.user.phone_number || "—" },
		{ label: "Timezone", value: orgUser?.user.timezone || "—" },
		{ label: "Marital status", value: orgUser?.user.marital_status || "—" },
		{ label: "Country", value: orgUser?.user.country || "—" },
		{ label: "State", value: orgUser?.user.state || "—" },
		{ label: "Address line 1", value: orgUser?.user.address_line1 || "—" },
		{ label: "Address line 2", value: orgUser?.user.address_line2 || "—" },
		{ label: "Postal code", value: orgUser?.user.postal_code || "—" },
		{ label: "Org ID", value: orgUser?.user.org_id || user?.org_id || "—" },
		{ label: "User ID", value: orgUser?.user.id || user?.id || "—" },
		{
			label: "Created at",
			value: formatDate(orgUser?.user.created_at) || "—",
		},
	];

	const employmentItems = [
		{ label: "Employee ID", value: orgUser?.membership.employee_id || "—" },
		{
			label: "Employment status",
			value: orgUser?.membership.employment_status || "—",
		},
		{
			label: "Platform status",
			value: orgUser?.membership.platform_status || "—",
		},
		{
			label: "Invitation status",
			value: orgUser?.membership.invitation_status || "—",
		},
		{
			label: "Employment start date",
			value: formatDate(orgUser?.membership.employment_start_date) || "—",
		},
		{
			label: "Invited at",
			value: formatDate(orgUser?.membership.invited_at) || "—",
		},
		{
			label: "Accepted at",
			value: formatDate(orgUser?.membership.accepted_at) || "—",
		},
		{
			label: "Membership created",
			value: formatDate(orgUser?.membership.created_at) || "—",
		},
		{
			label: "Active",
			value: user?.is_active ? "Yes" : "No",
		},
		{
			label: "Superuser",
			value: user?.is_superuser ? "Yes" : "No",
		},
		{
			label: "Roles",
			value: user?.roles?.length ? user.roles.join(", ") : "—",
		},
	];

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="User settings"
				subtitle="Manage your account details, security, and credentials."
			/>

			<div className="flex items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
				<TabButton
					label="Profile"
					value="profile"
					active={tab === "profile"}
					onSelect={setTab}
				/>
				<TabButton
					label="Security"
					value="security"
					active={tab === "security"}
					onSelect={setTab}
				/>
			</div>

			<div className="rounded-lg border bg-card shadow-sm">
				{isLoading ? (
					<div className="p-6 text-sm text-muted-foreground">
						Loading your settings…
					</div>
				) : isError ? (
					<div className="p-6 text-sm text-destructive">
						Unable to load your profile right now. Please retry in a moment.
					</div>
				) : tab === "profile" ? (
					<div className="space-y-4 p-6">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
								<UserCircle2 className="h-6 w-6" />
							</div>
							<div>
								<h2 className="text-lg font-semibold">Profile</h2>
								<p className="text-sm text-muted-foreground">
									Your basic account information and org context.
								</p>
							</div>
						</div>
						<Separator />
						<SectionGrid items={personalItems} />
						<Separator />
						<div>
							<h3 className="mb-3 text-sm font-semibold text-foreground">
								Employment
							</h3>
							<SectionGrid items={employmentItems} />
						</div>
					</div>
				) : (
					<div className="space-y-4 p-6">
						<div className="flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
								<ShieldCheck className="h-6 w-6" />
							</div>
							<div>
								<h2 className="text-lg font-semibold">Security</h2>
								<p className="text-sm text-muted-foreground">
									Review sign-in protections and update your password.
								</p>
							</div>
						</div>
						<Separator />
						<div className="grid gap-4 md:grid-cols-2">
							<Card className="border-border/70">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-semibold">MFA</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2 text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										{user?.mfa_enabled ? (
											<ShieldCheck className="h-4 w-4 text-emerald-600" />
										) : (
											<ShieldOff className="h-4 w-4 text-amber-500" />
										)}
										<span className="font-medium text-foreground">
											{user?.mfa_enabled ? "Enabled" : "Not enabled"}
										</span>
									</div>
									<p>
										{user?.mfa_enabled
											? "Multi-factor authentication is active on your account."
											: "Add MFA in the identity provider to increase account protection."}
									</p>
								</CardContent>
							</Card>

							<Card className="border-border/70">
								<CardHeader className="pb-2">
									<CardTitle className="text-sm font-semibold">
										Password
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3 text-sm text-muted-foreground">
									<p>Update your password to keep your account secure.</p>
									<Button asChild variant="outline" size="sm">
										<Link to={routes.changePassword}>Change password</Link>
									</Button>
								</CardContent>
							</Card>
						</div>
					</div>
				)}
			</div>
		</PageContainer>
	);
}

function TabButton({
	label,
	value,
	active,
	onSelect,
}: UserSettingsTabButtonProps) {
	return (
		<button
			type="button"
			onClick={() => onSelect(value)}
			className={cn(
				"flex items-center rounded-md px-3 py-2 text-sm font-semibold transition",
				active
					? "bg-primary text-primary-foreground shadow-sm"
					: "text-muted-foreground hover:bg-muted hover:text-foreground"
			)}
		>
			{label}
		</button>
	);
}

function InfoCard({ label, value }: UserSettingsInfoCardProps) {
	return (
		<Card className="border-border/70">
			<CardHeader className="pb-1">
				<CardTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
					{label}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-sm text-foreground">{value || "—"}</p>
			</CardContent>
		</Card>
	);
}

function SectionGrid({ items }: UserSettingsSectionGridProps) {
	return (
		<div className="grid gap-3 md:grid-cols-2">
			{items.map((item) => (
				<InfoCard key={item.label} label={item.label} value={item.value} />
			))}
		</div>
	);
}
