import { useQuery } from "@tanstack/react-query";
import { Database, RefreshCcw, Server, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { PageHeader } from "@/components/common/PageHeader";
import { PageContainer } from "@/components/layout/PageContainer";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { getStatusSummary } from "../api/status.api";
import type { ServiceStatus } from "../types";
import { statusCopy } from "../types";
import type { ServiceCardProps } from "../types";

export function StatusPage() {
	const { data, isLoading, isError, refetch } = useQuery({
		queryKey: ["status-summary"],
		queryFn: getStatusSummary,
		staleTime: 0,
	});

	const renderStatusBadge = (status: ServiceStatus) => {
		const definition = statusCopy[status];
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
		return (
			<PageContainer>
				<LoadingState label="Checking platform status..." />
			</PageContainer>
		);
	}

	if (isError || !data) {
		return (
			<>
				<PublicHeader />
				<PageContainer className="flex min-h-[60vh] items-center justify-center">
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

	return (
		<>
			<PublicHeader />
			<PageContainer className="space-y-6 pt-6">
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
					<div className="flex flex-wrap items-center gap-2">
						{data.environment ? (
							<span className="inline-flex items-center rounded-full border bg-muted/60 px-3 py-1 text-xs font-semibold uppercase text-foreground">
								Environment: {data.environment}
							</span>
						) : null}
						<span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
							Ready: {data.ready ? "Yes" : "No"}
						</span>
						{data.version ? (
							<span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold text-foreground">
								Version: {data.version}
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
							status={data.checks.api?.status || "down"}
							version={data.checks.api?.version}
							message={data.checks.api?.message}
							icon={Server}
						/>
						<ServiceCard
							name="Database"
							status={data.checks.database?.status || "down"}
							message={data.checks.database?.message}
							icon={Database}
						/>
						<ServiceCard
							name="Redis"
							status={data.checks.redis?.status || "down"}
							message={data.checks.redis?.message}
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
						<table className="w-full text-sm">
							<thead className="text-left text-xs uppercase text-muted-foreground">
								<tr className="border-b">
									<th className="px-4 py-3">Service</th>
									<th className="px-4 py-3">Status</th>
									<th className="px-4 py-3">Version</th>
									<th className="px-4 py-3">Notes</th>
								</tr>
							</thead>
							<tbody>
								{Object.entries(data.checks).map(([name, check]) => {
									if (!check) return null;
									const copy = statusCopy[check.status];
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
								})}
							</tbody>
						</table>
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
	const copy = statusCopy[status];
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
