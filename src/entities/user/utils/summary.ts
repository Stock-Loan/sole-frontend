import { normalizeDisplay } from "@/shared/lib/utils";
import { colorPalette } from "@/app/styles/color-palette";
import type { UserDashboardSummary } from "@/entities/user/types";
import type {
	UserSummaryMetric,
	UserSummaryPieItem,
	UserSummaryTrendItem,
} from "@/entities/user/components/types";

const platformOrder = ["ACTIVE", "SUSPENDED", "INVITED", "ENABLED", "DISABLED"] as const;
const invitationOrder = ["PENDING", "ACCEPTED", "EXPIRED", "INVITED"] as const;
const employmentOrder = [
	"ACTIVE",
	"ON_LEAVE",
	"PROBATIONARY",
	"TERMINATED",
	"SUSPENDED",
] as const;

const formatCount = (value?: number | null) =>
	value === null || value === undefined ? "—" : value.toLocaleString();

export function buildUserSummaryMetrics(
	summary?: UserDashboardSummary | null
): UserSummaryMetric[] {
	if (!summary) return [];
	return [
		{ label: "Total users", value: formatCount(summary.total_users) },
		{ label: "Active users", value: formatCount(summary.active_users) },
		{ label: "Suspended users", value: formatCount(summary.suspended_users) },
		{ label: "Invites pending", value: formatCount(summary.invited_pending) },
		{ label: "Invites accepted", value: formatCount(summary.accepted_invites) },
		{ label: "MFA enabled", value: formatCount(summary.mfa_enabled) },
		{ label: "Never logged in", value: formatCount(summary.never_logged_in) },
		{
			label: "Temp passwords",
			value: formatCount(summary.users_with_temp_password),
		},
		{
			label: "Missing profile fields",
			value: formatCount(summary.missing_profile_fields),
		},
		{
			label: "Without department",
			value: formatCount(summary.users_without_department),
		},
	];
}

export function buildPlatformStatusItems(
	summary?: UserDashboardSummary | null
): UserSummaryPieItem[] {
	if (!summary) return [];
	const counts = summary.platform_status_counts ?? {};
	return platformOrder.map((status, index) => ({
		label: normalizeDisplay(status),
		value: counts[status] ?? 0,
		color: Object.values(colorPalette.chart)[index % 6],
	}));
}

export function buildInvitationStatusItems(
	summary?: UserDashboardSummary | null
): UserSummaryPieItem[] {
	if (!summary) return [];
	const counts = summary.invitation_status_counts ?? {};
	return invitationOrder.map((status, index) => ({
		label: normalizeDisplay(status),
		value: counts[status] ?? 0,
		color: Object.values(colorPalette.chart)[(index + 2) % 6],
	}));
}

export function buildEmploymentStatusItems(
	summary?: UserDashboardSummary | null
): UserSummaryPieItem[] {
	if (!summary) return [];
	const counts = summary.employment_status_counts ?? {};
	return employmentOrder.map((status, index) => ({
		label: normalizeDisplay(status),
		value: counts[status] ?? 0,
		color: Object.values(colorPalette.chart)[(index + 3) % 6],
	}));
}

export function buildMfaItems(
	summary?: UserDashboardSummary | null
): UserSummaryPieItem[] {
	if (!summary) return [];
	return [
		{
			label: "MFA enabled",
			value: summary.mfa_enabled,
			color: colorPalette.status.success[500],
		},
		{
			label: "MFA disabled",
			value: summary.mfa_disabled,
			color: colorPalette.status.warning[500],
		},
	];
}

export function buildEngagementTrendItems(
	summary?: UserDashboardSummary | null
): UserSummaryTrendItem[] {
	if (!summary) return [];
	return [
		{
			label: "Active last 7 days",
			value: summary.active_last_7_days,
			color: colorPalette.chart[1],
		},
		{
			label: "Active last 30 days",
			value: summary.active_last_30_days,
			color: colorPalette.chart[2],
		},
		{
			label: "Stale 30+ days",
			value: summary.stale_30_plus_days,
			color: colorPalette.chart[4],
		},
	];
}

export function buildDepartmentItems(
	summary?: UserDashboardSummary | null
): UserSummaryPieItem[] {
	if (!summary) return [];
	const departments = summary.department_counts ?? [];
	const items = departments
		.slice()
		.sort((a, b) => b.count - a.count)
		.map((item, index) => ({
			label: item.department_name ?? "Unknown",
			value: item.count,
			color: Object.values(colorPalette.chart)[index % 6],
		}));

	if (summary.users_without_department > 0) {
		items.push({
			label: "No department",
			value: summary.users_without_department,
			color: colorPalette.slate[300],
		});
	}

	const totalFromItems = items.reduce((sum, item) => sum + item.value, 0);
	const remainder = summary.total_users - totalFromItems;
	if (remainder > 0) {
		items.push({
			label: "Unclassified",
			value: remainder,
			color: colorPalette.slate[200],
		});
	}

	return items;
}

export function buildRoleItems(
	summary?: UserDashboardSummary | null
): UserSummaryPieItem[] {
	if (!summary) return [];
	const items = (summary.role_counts ?? []).filter(
		(item) =>
			(item.role_name ?? "").toUpperCase() !== "EMPLOYEE" &&
			item.count > 0
	);
	return items
		.slice()
		.sort((a, b) => b.count - a.count)
		.map((item, index) => ({
			label: item.role_name ?? "Unknown",
			value: item.count,
			color: Object.values(colorPalette.chart)[index % 6],
		}));
}
