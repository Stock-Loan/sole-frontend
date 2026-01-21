import { useMemo } from "react";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Card, CardContent, CardHeader } from "@/shared/ui/card";
import { Skeleton } from "@/shared/ui/Skeleton";
import { usePermissions } from "@/auth/hooks";
import { useOrgUserSummary } from "@/entities/user/hooks";
import {
	buildDepartmentItems,
	buildEmploymentStatusItems,
	buildEngagementTrendItems,
	buildInvitationStatusItems,
	buildMfaItems,
	buildPlatformStatusItems,
	buildRoleItems,
	buildUserSummaryMetrics,
} from "@/entities/user/utils/summary";
import { UserSummaryMetricGrid } from "@/entities/user/components/UserSummaryMetricGrid";
import { UserSummaryPieChart } from "@/entities/user/components/UserSummaryPieChart";
import { UserSummaryTrendCard } from "@/entities/user/components/UserSummaryTrendCard";

const CHART_LAYOUT = "grid gap-4 lg:grid-cols-2";

export function UserSummaryPage() {
	const { can } = usePermissions();
	const canViewUsers = can("user.view");
	const summaryQuery = useOrgUserSummary(canViewUsers);
	const summary = summaryQuery.data;

	const metrics = useMemo(() => buildUserSummaryMetrics(summary), [summary]);
	const platformItems = useMemo(
		() => buildPlatformStatusItems(summary),
		[summary],
	);
	const invitationItems = useMemo(
		() => buildInvitationStatusItems(summary),
		[summary],
	);
	const employmentItems = useMemo(
		() => buildEmploymentStatusItems(summary),
		[summary],
	);
	const mfaItems = useMemo(() => buildMfaItems(summary), [summary]);
	const engagementItems = useMemo(
		() => buildEngagementTrendItems(summary),
		[summary],
	);
	const departmentItems = useMemo(
		() => buildDepartmentItems(summary),
		[summary],
	);
	const roleItems = useMemo(() => buildRoleItems(summary), [summary]);

	if (!canViewUsers) {
		return (
			<PageContainer className="space-y-6">
				<EmptyState
					title="User summary unavailable"
					message="You do not have permission to view user summary metrics."
				/>
			</PageContainer>
		);
	}

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="User Summary"
				subtitle="Track user activity, engagement, and access coverage."
			/>

			{summaryQuery.isLoading ? (
				<UserSummarySkeleton />
			) : summaryQuery.isError ? (
				<EmptyState
					title="Unable to load summary"
					message="We couldn't fetch user summary data right now."
					actionLabel="Retry"
					onRetry={() => summaryQuery.refetch()}
				/>
			) : (
				<div className="space-y-6">
					<UserSummaryMetricGrid metrics={metrics} />

					<div className={CHART_LAYOUT}>
						<UserSummaryPieChart
							title="Platform status"
							items={platformItems}
							total={summary?.total_users}
							emptyMessage="No platform status data yet."
						/>
						<UserSummaryPieChart
							title="Invitation status"
							items={invitationItems}
							total={summary?.total_users}
							emptyMessage="No invitation data yet."
						/>
					</div>

					<div className={CHART_LAYOUT}>
						<UserSummaryPieChart
							title="Employment status"
							items={employmentItems}
							total={summary?.total_users}
							emptyMessage="No employment status data yet."
						/>
						<UserSummaryPieChart
							title="MFA adoption"
							items={mfaItems}
							total={summary?.total_users}
							emptyMessage="No MFA data yet."
						/>
					</div>

					<div className={CHART_LAYOUT}>
						<UserSummaryTrendCard
							title="Engagement trend"
							items={engagementItems}
							total={summary?.total_users}
							emptyMessage="No engagement data yet."
						/>
						<Card className="h-full">
							<CardHeader className="pb-2">
								<h3 className="text-sm font-semibold">
									Roles with zero members
								</h3>
							</CardHeader>
							<CardContent className="space-y-2 text-sm text-muted-foreground">
								{summary?.roles_with_zero_members?.length ? (
									<ul className="list-disc pl-4">
										{summary.roles_with_zero_members.map((role) => (
											<li key={role}>{role}</li>
										))}
									</ul>
								) : (
									<p>No empty roles detected.</p>
								)}
							</CardContent>
						</Card>
					</div>

					<div className={CHART_LAYOUT}>
						<UserSummaryPieChart
							title="Users by department"
							items={departmentItems}
							total={summary?.total_users}
							emptyMessage="No department data yet."
						/>
						<UserSummaryPieChart
							title="Users by role"
							items={roleItems}
							total={summary?.total_users}
							emptyMessage="No role data yet."
						/>
					</div>
				</div>
			)}
		</PageContainer>
	);
}

function UserSummarySkeleton() {
	return (
		<div className="space-y-6">
			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
				{Array.from({ length: 8 }).map((_, index) => (
					<Card key={`user-summary-metric-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-3 w-28" />
						</CardHeader>
						<CardContent>
							<Skeleton className="h-7 w-24" />
						</CardContent>
					</Card>
				))}
			</div>
			<div className="grid gap-4 lg:grid-cols-2">
				{Array.from({ length: 2 }).map((_, index) => (
					<Card key={`user-summary-chart-${index}`}>
						<CardHeader className="pb-2">
							<Skeleton className="h-4 w-32" />
						</CardHeader>
						<CardContent className="space-y-3">
							<Skeleton className="h-32 w-full" />
							<Skeleton className="h-4 w-32" />
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
