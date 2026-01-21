import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, ShieldOff, UserCircle2 } from "lucide-react";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { Button } from "@/shared/ui/Button";
import { Separator } from "@/shared/ui/separator";
import { Skeleton } from "@/shared/ui/Skeleton";
import { routes } from "@/shared/lib/routes";
import { formatDate } from "@/shared/lib/format";
import { TabButton } from "@/shared/ui/TabButton";
import { useAuth } from "@/auth/hooks/hooks";
import { useUserSettings } from "@/features/user-settings/hooks";
import { RecoveryCodesManager } from "@/auth/components/RecoveryCodesManager";
import type {
	UserSettingsInfoCardProps,
	UserSettingsSectionGridProps,
	UserSettingsTabKey,
} from "@/features/user-settings/types";

export function MySettingsPage() {
	const { user: cachedUser } = useAuth();
	const [tab, setTab] = useState<UserSettingsTabKey>("profile");

	const { data: profile, isLoading, isError } = useUserSettings();

	const profileUser = profile?.user;
	const membership = profile?.membership;
	const user = profileUser ?? cachedUser;
	const securityUser = cachedUser ?? null;

	const roleLabels = profile?.roles?.length
		? profile.roles
				.map((role) => role.name || role.id)
				.filter(Boolean)
				.join(", ")
		: cachedUser?.roles?.length
			? cachedUser.roles.join(", ")
			: "—";

	const personalItems = [
		{ label: "First name", value: profileUser?.first_name || "—" },
		{ label: "Middle name", value: profileUser?.middle_name || "—" },
		{ label: "Last name", value: profileUser?.last_name || "—" },
		{ label: "Preferred name", value: profileUser?.preferred_name || "—" },
		{ label: "Email", value: profileUser?.email || user?.email || "—" },
		{ label: "Phone number", value: profileUser?.phone_number || "—" },
		{ label: "Timezone", value: profileUser?.timezone || "—" },
		{ label: "Marital status", value: profileUser?.marital_status || "—" },
		{ label: "Country", value: profileUser?.country || "—" },
		{ label: "State", value: profileUser?.state || "—" },
		{ label: "Address line 1", value: profileUser?.address_line1 || "—" },
		{ label: "Address line 2", value: profileUser?.address_line2 || "—" },
		{ label: "Postal code", value: profileUser?.postal_code || "—" },
		{
			label: "Org ID",
			value: profileUser?.org_id || membership?.org_id || user?.org_id || "—",
		},
		{ label: "User ID", value: profileUser?.id || user?.id || "—" },
		{
			label: "Created at",
			value: formatDate(profileUser?.created_at) || "—",
		},
	];

	const employmentItems = [
		{ label: "Employee ID", value: membership?.employee_id || "—" },
		{
			label: "Employment status",
			value: membership?.employment_status || "—",
		},
		{
			label: "Platform status",
			value: membership?.platform_status || "—",
		},
		{
			label: "Invitation status",
			value: membership?.invitation_status || "—",
		},
		{
			label: "Employment start date",
			value: formatDate(membership?.employment_start_date) || "—",
		},
		{
			label: "Invited at",
			value: formatDate(membership?.invited_at) || "—",
		},
		{
			label: "Accepted at",
			value: formatDate(membership?.accepted_at) || "—",
		},
		{
			label: "Membership created",
			value: formatDate(membership?.created_at) || "—",
		},
		{
			label: "Active",
			value:
				securityUser?.is_active === undefined
					? "—"
					: securityUser.is_active
						? "Yes"
						: "No",
		},
		{
			label: "Superuser",
			value:
				securityUser?.is_superuser === undefined
					? "—"
					: securityUser.is_superuser
						? "Yes"
						: "No",
		},
		{
			label: "Roles",
			value: roleLabels,
		},
	];

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="User settings"
				subtitle="Manage your account details, security, and credentials."
			/>

			<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
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

			<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
				{isLoading ? (
					<SettingsSkeleton />
				) : isError ? (
					<div className="p-6 text-sm text-destructive">
						Unable to load your profile right now. Please retry in a moment.
					</div>
				) : tab === "profile" ? (
					<div className="flex min-h-0 flex-1 flex-col">
						<div className="border-b border-border/70 px-6 py-4">
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
						</div>
						<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
							<SectionGrid items={personalItems} />
							<Separator className="my-4" />
							<div>
								<h3 className="mb-3 text-sm font-semibold text-foreground">
									Employment
								</h3>
								<SectionGrid items={employmentItems} />
							</div>
						</div>
					</div>
				) : (
					<div className="flex min-h-0 flex-1 flex-col">
						<div className="border-b border-border/70 px-6 py-4">
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
						</div>
						<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
							<div className="space-y-2 text-sm text-muted-foreground">
								<div className="flex items-center gap-2">
									{securityUser?.mfa_enabled ? (
										<ShieldCheck className="h-4 w-4 text-emerald-600" />
									) : (
										<ShieldOff className="h-4 w-4 text-amber-500" />
									)}
									<span className="font-medium text-foreground">MFA</span>
								</div>
								<p>
									{securityUser?.mfa_enabled
										? "Multi-factor authentication is active on your account."
										: "Add MFA in the identity provider to increase account protection."}
								</p>
								<p className="text-xs text-muted-foreground">
									Status:{" "}
									{securityUser?.mfa_enabled ? "Enabled" : "Not enabled"}
								</p>
							</div>
							{securityUser?.mfa_enabled && (
								<>
									<Separator />
									<RecoveryCodesManager />
								</>
							)}
							<Separator />
							<div className="space-y-2 text-sm text-muted-foreground">
								<p className="font-medium text-foreground">Password</p>
								<p>Update your password to keep your account secure.</p>
								<Button asChild variant="outline" size="sm">
									<Link to={routes.changePassword}>Change password</Link>
								</Button>
							</div>
						</div>
					</div>
				)}
			</div>
		</PageContainer>
	);
}

function InfoCard({ label, value }: UserSettingsInfoCardProps) {
	return (
		<div className="space-y-1">
			<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="text-sm text-foreground">{value || "—"}</p>
		</div>
	);
}

function SectionGrid({ items }: UserSettingsSectionGridProps) {
	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{items.map((item: UserSettingsInfoCardProps) => (
				<InfoCard key={item.label} label={item.label} value={item.value} />
			))}
		</div>
	);
}

function SettingsSkeleton() {
	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-3">
				<Skeleton className="h-12 w-12 rounded-md" />
				<div className="space-y-2">
					<Skeleton className="h-4 w-32" />
					<Skeleton className="h-3 w-56" />
				</div>
			</div>
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<div key={`profile-skeleton-${index}`} className="space-y-2">
						<Skeleton className="h-3 w-24" />
						<Skeleton className="h-4 w-32" />
					</div>
				))}
			</div>
			<Separator className="my-2" />
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<div key={`employment-skeleton-${index}`} className="space-y-2">
						<Skeleton className="h-3 w-24" />
						<Skeleton className="h-4 w-36" />
					</div>
				))}
			</div>
		</div>
	);
}
