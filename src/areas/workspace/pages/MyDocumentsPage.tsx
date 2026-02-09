import { useMemo } from "react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PageHeader } from "@/shared/ui/PageHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { Skeleton } from "@/shared/ui/Skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/Button";
import { routes } from "@/shared/lib/routes";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { normalizeDisplay } from "@/shared/lib/utils";
import { usePermissions } from "@/auth/hooks";
import { useMyLoanApplications } from "@/entities/loan/hooks";
import { LoanStatusBadge } from "@/entities/loan/components/loan-pages/LoanStatusBadge";

export function MyDocumentsPage() {
	const { can } = usePermissions();
	const canViewDocuments =
		can("loan.document.self_view") || can("loan.view_own");

	const loansQuery = useMyLoanApplications(
		{ limit: 50, offset: 0 },
		{ enabled: canViewDocuments },
	);

	const loans = useMemo(
		() =>
			[...(loansQuery.data?.items ?? [])].sort((left, right) => {
				const leftTime = getSortableTimestamp(
					left.updated_at ?? left.created_at ?? null,
				);
				const rightTime = getSortableTimestamp(
					right.updated_at ?? right.created_at ?? null,
				);
				return rightTime - leftTime;
			}),
		[loansQuery.data?.items],
	);

	const inReviewCount = loans.filter(
		(loan) => loan.status === "SUBMITTED" || loan.status === "IN_REVIEW",
	).length;
	const readyDocumentsCount = loans.filter((loan) => loan.status !== "DRAFT")
		.length;
	const closedCount = loans.filter(
		(loan) =>
			loan.status === "COMPLETED" ||
			loan.status === "REJECTED" ||
			loan.status === "CANCELLED",
	).length;

	if (loansQuery.isLoading) {
		return <MyDocumentsPageSkeleton />;
	}

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-6">
			<PageHeader
				title="My documents"
				subtitle="Review your loan documents and upload required forms."
				actions={
					<Button asChild variant="outline">
						<Link to={routes.workspaceLoans}>View my loans</Link>
					</Button>
				}
			/>

			{!canViewDocuments ? (
				<EmptyState
					title="Documents unavailable"
					message="You do not have permission to view loan documents."
				/>
			) : loansQuery.isError ? (
				<EmptyState
					title="Unable to load documents"
					message="We couldn't fetch your loan documents right now."
					actionLabel="Retry"
					onRetry={() => loansQuery.refetch()}
				/>
			) : loans.length === 0 ? (
				<EmptyState
					title="No loan documents yet"
					message="Documents will appear once you submit a loan application and admins upload your signed documents."
				/>
			) : (
				<>
					<Card className="border border-border/70 bg-muted/20">
						<CardHeader className="pb-3">
							<CardTitle className="text-base">Document overview</CardTitle>
						</CardHeader>
						<CardContent className="grid gap-3 sm:grid-cols-3">
							<MetricTile label="Total applications" value={String(loans.length)} />
							<MetricTile label="In review" value={String(inReviewCount)} />
							<MetricTile
								label="Ready for documents"
								value={String(readyDocumentsCount)}
							/>
						</CardContent>
						<CardContent className="pt-0">
							<p className="text-xs text-muted-foreground">
								{closedCount > 0
									? `${closedCount} closed application${closedCount === 1 ? "" : "s"} are still available for document history.`
									: "Documents remain available as your application moves through each stage."}
							</p>
						</CardContent>
					</Card>

					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{loans.map((loan) => (
							<Card key={loan.id} className="border border-border/70 shadow-sm">
								<CardHeader className="space-y-3 pb-2">
									<div className="flex items-center justify-between gap-3">
										<CardTitle className="truncate text-sm font-semibold">
											Loan application
										</CardTitle>
										<LoanStatusBadge status={loan.status} />
									</div>
									<p className="truncate text-xs text-muted-foreground">
										{loan.id}
									</p>
								</CardHeader>
								<CardContent className="space-y-4 text-sm">
									<div className="grid grid-cols-2 gap-3 text-xs">
										<DocumentField
											label="Created"
											value={formatDate(loan.created_at)}
										/>
										<DocumentField
											label="Updated"
											value={formatDate(loan.updated_at)}
										/>
										<DocumentField
											label="Loan principal"
											value={formatCurrency(loan.loan_principal)}
										/>
										<DocumentField
											label="Shares"
											value={
												typeof loan.shares_to_exercise === "number"
													? loan.shares_to_exercise.toLocaleString()
													: "—"
											}
										/>
									</div>
									<div className="rounded-md border border-border/60 px-3 py-2">
										<p className="text-[11px] uppercase tracking-wide text-muted-foreground">
											Current stage
										</p>
										<p className="text-sm font-medium text-foreground">
											{normalizeDisplay(loan.current_stage_type)}
										</p>
									</div>
									<Button asChild variant="outline" size="sm" className="w-full">
										<Link
											to={routes.workspaceLoanDocuments.replace(":id", loan.id)}
										>
											View documents
										</Link>
									</Button>
								</CardContent>
							</Card>
						))}
					</div>
				</>
			)}
		</PageContainer>
	);
}

function MetricTile({ label, value }: { label: string; value: string }) {
	return (
		<div className="rounded-lg border border-border/70 bg-background px-3 py-3">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="mt-1 text-xl font-semibold leading-none">{value}</p>
		</div>
	);
}

function DocumentField({ label, value }: { label: string; value: string }) {
	return (
		<div className="space-y-1">
			<p className="text-[11px] uppercase tracking-wide text-muted-foreground">
				{label}
			</p>
			<p className="font-medium text-foreground">{value}</p>
		</div>
	);
}

function MyDocumentsPageSkeleton() {
	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-6">
			<PageHeader
				title="My documents"
				subtitle="Review your loan documents and upload required forms."
				actions={<Skeleton className="h-9 w-28" />}
			/>

			<Card className="border border-border/70 bg-muted/20">
				<CardHeader className="pb-3">
					<Skeleton className="h-5 w-40" />
				</CardHeader>
				<CardContent className="grid gap-3 sm:grid-cols-3">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={`doc-metric-skeleton-${index}`}
							className="rounded-lg border border-border/70 bg-background px-3 py-3"
						>
							<Skeleton className="h-3 w-28" />
							<Skeleton className="mt-2 h-7 w-12" />
						</div>
					))}
				</CardContent>
				<CardContent className="pt-0">
					<Skeleton className="h-3 w-80 max-w-full" />
				</CardContent>
			</Card>

			<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
				{Array.from({ length: 6 }).map((_, index) => (
					<Card
						key={`doc-card-skeleton-${index}`}
						className="border border-border/70 shadow-sm"
					>
						<CardHeader className="space-y-3 pb-2">
							<div className="flex items-center justify-between gap-3">
								<Skeleton className="h-4 w-28" />
								<Skeleton className="h-6 w-20 rounded-full" />
							</div>
							<Skeleton className="h-3 w-40" />
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-3">
								{Array.from({ length: 4 }).map((__, metricIndex) => (
									<div key={`doc-row-skeleton-${index}-${metricIndex}`}>
										<Skeleton className="h-3 w-20" />
										<Skeleton className="mt-2 h-4 w-24" />
									</div>
								))}
							</div>
							<div className="rounded-md border border-border/60 px-3 py-2">
								<Skeleton className="h-3 w-20" />
								<Skeleton className="mt-2 h-4 w-32" />
							</div>
							<Skeleton className="h-9 w-full rounded-md" />
						</CardContent>
					</Card>
				))}
			</div>
		</PageContainer>
	);
}

function getSortableTimestamp(value?: string | null) {
	if (!value) return 0;
	const timestamp = new Date(value).getTime();
	return Number.isNaN(timestamp) ? 0 : timestamp;
}
