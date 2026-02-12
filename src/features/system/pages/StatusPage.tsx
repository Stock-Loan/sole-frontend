import { Database, RefreshCcw, Server, WifiOff } from "lucide-react";
import { Button } from "@/shared/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PublicHeader } from "@/shared/ui/PublicHeader";
import { Skeleton } from "@/shared/ui/Skeleton";
import type { ServiceCardProps, ServiceStatus } from "@/features/system/types";
import { statusCopy } from "@/features/system/types";
import { useStatusSummary } from "@/features/system/hooks";

export function StatusPage() {
	const { data, isLoading, isError, refetch } = useStatusSummary();

	const renderStatusBadge = (status: ServiceStatus) => {
		const definition = statusCopy[status] ?? statusCopy.down;
		const Icon = definition.icon;
		return (
			<span
				className={`inline-flex items-center gap-1 text-sm font-medium ${definition.className}`}
			>
				<Icon className="h-4 w-4" aria-hidden="true" />
				{definition.label}
			</span>
		);
	};

	if (isLoading) {
		return <StatusPageSkeleton />;
	}

	if (isError || !data) {
		return (
			<>
				<PublicHeader />
				<PageContainer className="mx-auto flex max-w-5xl min-h-[60vh] items-center justify-center px-4">
					<EmptyState
						title="Status service unreachable"
						message="We couldn't reach the platform backend to retrieve health data. The service may be offline or your network is disconnected. Please retry or contact support if this persists."
						onRetry={refetch}
						actionLabel="Try again"
					/>
				</PageContainer>
			</>
		);
	}

	const checks = data.checks ?? {};
	const apiCheck = checks.api;
	const databaseCheck = checks.database;
	const redisCheck = checks.redis;
	const checkEntries = Object.entries(checks).filter(([, check]) => Boolean(check));

	return (
		<>
			<PublicHeader />
			<PageContainer className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<PageHeader
						title="Platform status"
						subtitle="Live health for API, database, and Redis."
						actions={
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								<RefreshCcw className="mr-2 h-4 w-4" />
								Refresh
							</Button>
						}
					/>
					<div className="flex flex-wrap items-center gap-2 pb-1">
						{data.environment ? (
							<span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
								Environment: {data.environment}
							</span>
						) : null}
						<span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
							Ready: {data.ready ? "Yes" : "No"}
						</span>
						{data.version ? (
							<span className="inline-flex items-center rounded-full bg-muted/60 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
								v{data.version}
							</span>
						) : null}
					</div>
				</div>
				<Card>
					<CardHeader className="flex flex-col gap-2 border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex flex-col">
							<CardTitle className="text-sm font-semibold text-muted-foreground">
								Overall
							</CardTitle>
							<p className="text-xs text-muted-foreground">
								Ready: {data.ready ? "Yes" : "No"} • Version:{" "}
								{data.version || "n/a"}
							</p>
						</div>
						{renderStatusBadge(data.status)}
					</CardHeader>
					<CardContent className="grid gap-4 p-6 sm:grid-cols-3">
						<ServiceCard
							name="API"
							status={normalizeServiceStatus(apiCheck?.status)}
							version={apiCheck?.version}
							message={apiCheck?.message}
							icon={Server}
						/>
						<ServiceCard
							name="Database"
							status={normalizeServiceStatus(databaseCheck?.status)}
							message={databaseCheck?.message}
							icon={Database}
						/>
						<ServiceCard
							name="Redis"
							status={normalizeServiceStatus(redisCheck?.status)}
							message={redisCheck?.message}
							icon={WifiOff}
						/>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="border-b bg-muted/10">
						<CardTitle className="text-sm font-semibold text-muted-foreground">
							Dependency checks
						</CardTitle>
					</CardHeader>
					<CardContent className="p-0">
						<div className="w-full overflow-x-auto">
							<table className="min-w-[520px] w-full text-sm">
								<thead className="text-left text-xs uppercase text-muted-foreground">
									<tr className="border-b">
										<th className="px-4 py-3">Service</th>
										<th className="px-4 py-3">Status</th>
										<th className="px-4 py-3">Version</th>
										<th className="px-4 py-3">Notes</th>
									</tr>
								</thead>
								<tbody>
								{checkEntries.length ? (
									checkEntries.map(([name, check]) => {
									if (!check) return null;
									const copy =
										statusCopy[normalizeServiceStatus(check.status)] ??
										statusCopy.down;
									const Icon = copy.icon;
										return (
											<tr key={name} className="border-b last:border-b-0">
												<td className="px-4 py-3 font-medium capitalize">
													{name}
												</td>
												<td className="px-4 py-3">
													<span
														className={`inline-flex items-center gap-1 ${copy.className}`}
													>
														<Icon className="h-4 w-4" aria-hidden="true" />
														{copy.label}
													</span>
												</td>
												<td className="px-4 py-3 text-muted-foreground">
													{check.version || "—"}
												</td>
												<td className="px-4 py-3 text-muted-foreground">
													{check.message || "No incidents reported"}
												</td>
											</tr>
										);
									})
								) : (
									<tr>
										<td
											colSpan={4}
											className="px-4 py-6 text-center text-sm text-muted-foreground"
										>
											No dependency check details available in this
											environment.
										</td>
									</tr>
								)}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>
				<div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
					<p>Last checked: {new Date(data.timestamp).toLocaleString()}</p>
					{data.version ? <p>Version: {data.version}</p> : null}
				</div>
			</PageContainer>
		</>
	);
}

function ServiceCard({
	name,
	status,
	version,
	message,
	icon: Icon,
}: ServiceCardProps) {
	const copy = statusCopy[status] ?? statusCopy.down;
	return (
		<div className="rounded-lg border bg-card p-4 shadow-sm transition hover:border-primary/40">
			<div className="flex items-center justify-between">
				<div>
					<p className="text-sm font-semibold">{name}</p>
					<p className="text-xs text-muted-foreground">
						{message ||
							(status === "ok"
								? "No incidents reported"
								: "Investigating issues")}
					</p>
					{version ? (
						<p className="text-xs text-muted-foreground">v{version}</p>
					) : null}
				</div>
				<div className="flex items-center gap-2">
					<Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					<copy.icon
						className={`h-5 w-5 ${copy.className}`}
						aria-hidden="true"
					/>
				</div>
			</div>
		</div>
	);
}

function StatusPageSkeleton() {
	return (
		<>
			<PublicHeader />
			<PageContainer className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
					<PageHeader
						title="Platform status"
						subtitle="Live health for API, database, and Redis."
						actions={<Skeleton className="h-9 w-24" />}
					/>
					<div className="flex flex-wrap items-center gap-2 pb-1">
						<Skeleton className="h-6 w-40 rounded-full" />
						<Skeleton className="h-6 w-20 rounded-full" />
						<Skeleton className="h-6 w-16 rounded-full" />
					</div>
				</div>

				<Card>
					<CardHeader className="flex flex-col gap-2 border-b bg-muted/20 sm:flex-row sm:items-center sm:justify-between">
						<div className="space-y-2">
							<Skeleton className="h-4 w-16" />
							<Skeleton className="h-3 w-48" />
						</div>
						<Skeleton className="h-6 w-24 rounded-full" />
					</CardHeader>
					<CardContent className="grid gap-4 p-6 sm:grid-cols-3">
						{Array.from({ length: 3 }).map((_, index) => (
							<div
								key={`status-service-skeleton-${index}`}
								className="rounded-lg border bg-card p-4 shadow-sm"
							>
								<div className="space-y-2">
									<Skeleton className="h-4 w-16" />
									<Skeleton className="h-3 w-40" />
									<Skeleton className="h-3 w-24" />
								</div>
							</div>
						))}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className="border-b bg-muted/10">
						<Skeleton className="h-4 w-36" />
					</CardHeader>
					<CardContent className="p-0">
						<div className="w-full overflow-x-auto">
							<table className="min-w-[520px] w-full text-sm">
								<thead>
									<tr className="border-b">
										<th className="px-4 py-3">
											<Skeleton className="h-3 w-20" />
										</th>
										<th className="px-4 py-3">
											<Skeleton className="h-3 w-16" />
										</th>
										<th className="px-4 py-3">
											<Skeleton className="h-3 w-16" />
										</th>
										<th className="px-4 py-3">
											<Skeleton className="h-3 w-16" />
										</th>
									</tr>
								</thead>
								<tbody>
									{Array.from({ length: 3 }).map((_, index) => (
										<tr
											key={`status-table-skeleton-${index}`}
											className="border-b last:border-b-0"
										>
											<td className="px-4 py-3">
												<Skeleton className="h-4 w-20" />
											</td>
											<td className="px-4 py-3">
												<Skeleton className="h-4 w-24" />
											</td>
											<td className="px-4 py-3">
												<Skeleton className="h-4 w-12" />
											</td>
											<td className="px-4 py-3">
												<Skeleton className="h-4 w-44" />
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				<div className="flex items-center gap-4 text-xs text-muted-foreground">
					<Skeleton className="h-3 w-48" />
					<Skeleton className="h-3 w-20" />
				</div>
			</PageContainer>
		</>
	);
}

function normalizeServiceStatus(status?: string): ServiceStatus {
	return status === "ok" || status === "degraded" ? status : "down";
}
