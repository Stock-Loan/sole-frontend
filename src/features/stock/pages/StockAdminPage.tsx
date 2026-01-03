import { useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/common/PageHeader";
import { TabButton } from "@/components/common/TabButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useDebounce } from "@/hooks/useDebounce";
import { listOrgUsers } from "@/features/org-users/api/orgUsers.api";
import { getOrgUserDisplayName } from "@/features/org-users/constants";
import type {
	OrgUserListItem,
	OrgUsersListResponse,
} from "@/features/org-users/types";
import { usePermissions } from "@/features/auth/hooks/usePermissions";
import { queryKeys } from "@/lib/queryKeys";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";
import { getStockSummary, listStockGrants } from "@/features/stock/api/stock.api";
import { StockGrantsSection } from "@/features/stock/components/StockGrantsSection";
import { formatShares, getEligibilityReasonLabel } from "@/features/stock/constants";
import type {
	StockAdminTabKey,
	StockGrantsSectionHandle,
	StockGrant,
	StockSummary,
	StockSummaryMetric,
} from "@/features/stock/types";

const SEARCH_PAGE_SIZE = 25;
const MAX_SEARCH_PAGES = 4;

export function StockAdminPage() {
	const { can } = usePermissions();
	const canViewSummary = can(["stock.vesting.view", "stock.eligibility.view"]);
	const canViewGrants = can("stock.grant.view") || can("stock.grant.manage");
	const canManageGrants = can("stock.grant.manage");

	const [tab, setTab] = useState<StockAdminTabKey>("summary");
	const [searchValue, setSearchValue] = useState("");
	const [selectedUser, setSelectedUser] = useState<OrgUserListItem | null>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const searchInputRef = useRef<HTMLInputElement>(null);
	const grantsRef = useRef<StockGrantsSectionHandle>(null);

	const debouncedSearch = useDebounce(searchValue.trim(), 300);
	const shouldSearch = debouncedSearch.length > 0;
	const backendSearchTerm =
		debouncedSearch.length > 3 ? debouncedSearch.slice(0, 3) : debouncedSearch;

	const searchQuery = useQuery<OrgUsersListResponse>({
		enabled: isSearchOpen && shouldSearch,
		queryKey: [
			...queryKeys.orgUsers.list({
				search: backendSearchTerm,
				page: 1,
				page_size: SEARCH_PAGE_SIZE,
			}),
			debouncedSearch,
		],
		queryFn: async () => {
			const normalizedFull = debouncedSearch.toLowerCase();
			const matchesFullTerm = (user: OrgUserListItem) => {
				const name = getOrgUserDisplayName(user.user).toLowerCase();
				const email = user.user.email?.toLowerCase() ?? "";
				const employeeId = user.membership.employee_id?.toLowerCase() ?? "";
				return (
					name.includes(normalizedFull) ||
					email.includes(normalizedFull) ||
					employeeId.includes(normalizedFull)
				);
			};

			const runSearch = async (term: string) => {
				let page = 1;
				let total = 0;
				let lastResponse: OrgUsersListResponse | null = null;
				const items: OrgUserListItem[] = [];
				const seen = new Set<string>();

				while (page <= MAX_SEARCH_PAGES) {
					lastResponse = await listOrgUsers({
						search: term,
						page,
						page_size: SEARCH_PAGE_SIZE,
					});
					(lastResponse.items ?? []).forEach((user) => {
						const key = user.membership.id;
						if (seen.has(key)) return;
						seen.add(key);
						items.push(user);
					});
					total = lastResponse.total ?? items.length;

					if (normalizedFull.length > 0 && items.some(matchesFullTerm)) {
						break;
					}
					if (items.length >= total || (lastResponse.items ?? []).length === 0) {
						break;
					}
					page += 1;
				}

				return {
					...(lastResponse ?? { items: [], total: 0 }),
					items,
					total,
				};
			};

			const initial = await runSearch(backendSearchTerm);
			if (initial.items?.length) return initial;
			const lower = backendSearchTerm.toLowerCase();
			if (lower !== backendSearchTerm) {
				return runSearch(lower);
			}
			return initial;
		},
		staleTime: 30 * 1000,
	});

	const suggestions = searchQuery.data?.items ?? [];
	const filteredSuggestions = useMemo(() => {
		if (!shouldSearch) return [];
		const needle = debouncedSearch.toLowerCase();
		return suggestions.filter((user) => {
			const name = getOrgUserDisplayName(user.user).toLowerCase();
			const email = user.user.email?.toLowerCase() ?? "";
			const employeeId = user.membership.employee_id?.toLowerCase() ?? "";
			return (
				name.includes(needle) ||
				email.includes(needle) ||
				employeeId.includes(needle)
			);
		});
	}, [debouncedSearch, shouldSearch, suggestions]);
	const showSuggestions = isSearchOpen && shouldSearch;

	const handleSelectUser = (user: OrgUserListItem) => {
		setSelectedUser(user);
		setSearchValue(getOrgUserDisplayName(user.user));
		setTab("summary");
		setIsSearchOpen(false);
		searchInputRef.current?.blur();
	};

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		setIsSearchOpen(true);
		if (selectedUser) {
			setSelectedUser(null);
		}
	};

	const membershipId = selectedUser?.membership.id ?? "";

	const summaryQuery = useQuery<StockSummary>({
		enabled: Boolean(membershipId) && canViewSummary,
		queryKey: queryKeys.stock.summary(membershipId),
		queryFn: () => getStockSummary(membershipId),
		placeholderData: (previous) => previous,
	});
	const grantEligibility =
		summaryQuery.data?.eligibility_result?.eligible_to_exercise;
	const isGrantActionBlocked =
		grantEligibility === false ||
		(canViewSummary && (summaryQuery.isLoading || summaryQuery.isFetching));

	const allGrantsQuery = useQuery<StockGrant[]>({
		enabled: Boolean(membershipId) && canViewGrants && tab === "summary",
		queryKey: queryKeys.stock.grants.all(membershipId),
		queryFn: async () => {
			const pageSize = 50;
			let page = 1;
			let total = 0;
			const items: StockGrant[] = [];

			while (true) {
				const response = await listStockGrants(membershipId, {
					page,
					page_size: pageSize,
				});
				items.push(...(response.items ?? []));
				total = response.total ?? items.length;
				if (items.length >= total || response.items.length === 0) {
					break;
				}
				page += 1;
			}

			return items;
		},
		placeholderData: (previous) => previous,
	});

	const vestingEvents = useMemo(() => {
		const grants = allGrantsQuery.data ?? [];
		return grants
			.flatMap((grant) =>
				(grant.vesting_events ?? []).map((event) => ({
					id: event.id ?? `${grant.id}-${event.vest_date}-${event.shares}`,
					grantId: grant.id,
					grantDate: grant.grant_date,
					status: grant.status,
					vestDate: event.vest_date,
					shares: event.shares,
				}))
			)
			.sort((a, b) =>
				new Date(a.vestDate).getTime() - new Date(b.vestDate).getTime()
			);
	}, [allGrantsQuery.data]);

	const summaryMetrics = useMemo<StockSummaryMetric[]>(() => {
		if (!summaryQuery.data) return [];
		const summary = summaryQuery.data;
		const nextVesting = summary.next_vesting_event
			? `${formatDate(summary.next_vesting_event.vest_date)} • ${formatShares(
					summary.next_vesting_event.shares
			  )} shares`
			: "—";

		return [
			{
				label: "Total granted shares",
				value: formatShares(summary.total_granted_shares),
			},
			{
				label: "Total vested shares",
				value: formatShares(summary.total_vested_shares),
			},
			{
				label: "Total unvested shares",
				value: formatShares(summary.total_unvested_shares),
			},
			{
				label: "Next vesting",
				value: nextVesting,
			},
		];
	}, [summaryQuery.data]);

	const displayName = selectedUser
		? getOrgUserDisplayName(selectedUser.user)
		: "";
	const userDetailPath = selectedUser
		? `${routes.users}/${selectedUser.membership.id}`
		: "";
	const userInitials = useMemo(() => {
		if (!selectedUser) return "U";
		const nameSource = displayName || selectedUser.user.email || "";
		const parts = nameSource
			.split(" ")
			.map((part) => part.trim())
			.filter(Boolean);
		if (parts.length >= 2) {
			return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
		}
		if (parts.length === 1) {
			return parts[0].slice(0, 2).toUpperCase();
		}
		return selectedUser.user.email?.slice(0, 2)?.toUpperCase() || "U";
	}, [displayName, selectedUser]);

	const statusChips = selectedUser
		? [
				{ label: "Employment", value: selectedUser.membership.employment_status },
				{ label: "Platform", value: selectedUser.membership.platform_status },
				selectedUser.membership.invitation_status
					? {
							label: "Invitation",
							value: selectedUser.membership.invitation_status,
						}
					: null,
		  ].filter(Boolean) as { label: string; value?: string | null }[]
		: [];

	const metaItems = selectedUser
		? [
				{
					label: "Employee ID",
					value: selectedUser.membership.employee_id ?? "—",
				},
				{
					label: "Department",
					value:
						selectedUser.membership.department_name ||
						selectedUser.membership.department ||
						"—",
				},
				{
					label: "Membership created",
					value: formatDate(selectedUser.membership.created_at) || "—",
				},
		  ]
		: [];

	const renderSummaryContent = () => {
		if (!canViewSummary) {
			return (
				<p className="text-sm text-muted-foreground">
					You do not have access to view stock summaries.
				</p>
			);
		}

		if (summaryQuery.isLoading) {
			return <p className="text-sm text-muted-foreground">Loading summary…</p>;
		}

		if (summaryQuery.isError || !summaryQuery.data) {
			return (
				<div className="flex flex-wrap items-center gap-3 text-sm text-destructive">
					<span>Unable to load stock summary.</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => summaryQuery.refetch()}
					>
						Retry
					</Button>
				</div>
			);
		}

		const eligibility = summaryQuery.data.eligibility_result;
		const isEligible = eligibility.eligible_to_exercise;
		const reasons =
			eligibility.reasons?.map((reason) => getEligibilityReasonLabel(reason)) ??
			[];

		return (
			<div className="space-y-5">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{summaryMetrics.map((metric) => (
						<div
							key={metric.label}
							className="rounded-lg border border-border/60 bg-card/70 p-4"
						>
							<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
								{metric.label}
							</p>
							<p className="mt-2 text-lg font-semibold text-foreground">
								{metric.value}
							</p>
						</div>
					))}
				</div>

				<div
					className={cn(
						"rounded-lg border p-4",
						isEligible
							? "border-emerald-200 bg-emerald-50/60"
							: "border-amber-200 bg-amber-50/60"
					)}
				>
					<div className="flex items-start gap-3">
						{isEligible ? (
							<CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
						) : (
							<AlertTriangle className="mt-0.5 h-5 w-5 text-amber-600" />
						)}
						<div>
							<p className="text-sm font-semibold text-foreground">
								{isEligible
									? "Eligible to exercise"
									: "Not eligible to exercise"}
							</p>
							<p className="text-sm text-muted-foreground">
								{isEligible
									? "This employee can currently exercise their vested shares."
									: "This employee is currently blocked from exercising shares."}
							</p>
							{reasons.length ? (
								<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
									{reasons.map((reason) => (
										<li key={reason}>• {reason}</li>
									))}
								</ul>
							) : (
								<p className="mt-2 text-sm text-muted-foreground">
									No blocking reasons reported.
								</p>
							)}
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-border/60 bg-card/70 p-4">
					<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
						Next vesting event
					</p>
					<p className="mt-2 text-sm text-foreground">
						{summaryMetrics[3]?.value || "—"}
					</p>
				</div>

				<div className="rounded-lg border border-border/60 bg-card/70 p-4">
					<div className="space-y-1">
						<p className="text-sm font-semibold text-foreground">
							Vesting events
						</p>
						<p className="text-xs text-muted-foreground">
							All scheduled vesting events across this employee's grants.
						</p>
					</div>
					<div className="mt-3">
						{!canViewGrants ? (
							<p className="text-sm text-muted-foreground">
								You do not have access to view vesting events.
							</p>
						) : allGrantsQuery.isLoading ? (
							<p className="text-sm text-muted-foreground">
								Loading vesting events…
							</p>
						) : allGrantsQuery.isError ? (
							<div className="flex flex-wrap items-center gap-3 text-sm text-destructive">
								<span>Unable to load vesting events.</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => allGrantsQuery.refetch()}
								>
									Retry
								</Button>
							</div>
						) : vestingEvents.length === 0 ? (
							<p className="text-sm text-muted-foreground">
								No vesting events found.
							</p>
						) : (
							<Table containerClassName="rounded-md border border-border/60">
								<TableHeader>
									<TableRow>
										<TableHead>Vest date</TableHead>
										<TableHead>Shares</TableHead>
										<TableHead>Grant date</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Grant ID</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{vestingEvents.map((event) => (
										<TableRow key={event.id}>
											<TableCell>{formatDate(event.vestDate)}</TableCell>
											<TableCell>{formatShares(event.shares)}</TableCell>
											<TableCell>{formatDate(event.grantDate)}</TableCell>
											<TableCell>{event.status}</TableCell>
											<TableCell className="text-xs text-muted-foreground">
												{event.grantId}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						)}
					</div>
				</div>
			</div>
		);
	};

	return (
		<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
			<PageHeader
				title="Stock administration"
				subtitle="Search employees to review their stock summary and grants."
				actions={
					<div className="relative w-full max-w-sm">
						<Search
							className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
							aria-hidden="true"
						/>
						<Input
							ref={searchInputRef}
							value={searchValue}
							onChange={(event) => handleSearchChange(event.target.value)}
							onFocus={() => setIsSearchOpen(true)}
							onBlur={() => setIsSearchOpen(false)}
							placeholder="Search by name or email"
							className="h-9 pl-9"
						/>
						{showSuggestions ? (
							<div className="absolute right-0 top-full z-30 mt-2 w-full rounded-md border border-border/70 bg-card shadow-lg">
								<div className="max-h-72 overflow-y-auto py-1 text-sm">
									{searchQuery.isError ? (
										<div className="px-3 py-2 text-destructive">
											Unable to search users.
										</div>
									) : searchQuery.isFetching ? (
										<div className="px-3 py-2 text-muted-foreground">
											Searching…
										</div>
									) : filteredSuggestions.length === 0 ? (
										<div className="px-3 py-2 text-muted-foreground">
											No users found.
										</div>
									) : (
										filteredSuggestions.map((user) => {
											const name = getOrgUserDisplayName(user.user);
											return (
												<button
													key={user.membership.id}
													type="button"
													onMouseDown={(event) => {
														event.preventDefault();
														handleSelectUser(user);
													}}
													className="w-full px-3 py-2 text-left hover:bg-muted"
												>
													<p className="text-sm font-semibold text-foreground">
														{name}
													</p>
													<p className="text-xs text-muted-foreground">
														{user.user.email}
														{user.membership.employee_id
															? ` • ${user.membership.employee_id}`
															: ""}
													</p>
												</button>
											);
										})
									)}
								</div>
							</div>
						) : null}
					</div>
				}
			/>

			{selectedUser ? (
				<>
					<div className="rounded-lg border border-border/60 bg-card px-5 py-4 shadow-sm">
						<div className="flex flex-wrap items-start justify-between gap-4">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
									{userInitials}
								</div>
								<div>
									<p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Currently viewing
									</p>
									<p className="text-lg font-semibold text-foreground">
										{displayName}
									</p>
									<p className="text-sm text-muted-foreground">
										{selectedUser.user.email}
									</p>
								</div>
							</div>
							<div className="flex flex-wrap items-center gap-2">
								{statusChips.map((chip) => (
									<Badge key={chip.label} variant="secondary">
										{chip.label}: {chip.value || "—"}
									</Badge>
								))}
								<Button asChild size="sm" variant="outline">
									<Link to={userDetailPath}>View user</Link>
								</Button>
							</div>
						</div>
						<div className="mt-4 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2 lg:grid-cols-3">
							{metaItems.map((item) => (
								<div key={item.label} className="space-y-1">
									<p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
										{item.label}
									</p>
									<p className="text-sm text-foreground">{item.value}</p>
								</div>
							))}
						</div>
					</div>

					<div className="inline-flex w-fit items-center gap-2 rounded-lg border bg-card px-2 py-2 shadow-sm">
						<TabButton
							label="Stock summary"
							value="summary"
							active={tab === "summary"}
							onSelect={setTab}
						/>
						<TabButton
							label="Stock grants"
							value="grants"
							active={tab === "grants"}
							onSelect={setTab}
						/>
					</div>

					<div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card shadow-sm">
						{tab === "summary" ? (
							<div className="flex min-h-0 flex-1 flex-col">
								<div className="border-b border-border/70 px-6 py-4">
									<h2 className="text-lg font-semibold">Stock Summary</h2>
									<p className="text-sm text-muted-foreground">
										Eligibility, vesting totals, and next events.
									</p>
								</div>
								<div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
									{renderSummaryContent()}
								</div>
							</div>
						) : (
							<div className="flex min-h-0 flex-1 flex-col">
								<div className="border-b border-border/70 px-6 py-4">
									<div className="flex flex-wrap items-start justify-between gap-3">
										<div>
											<h2 className="text-lg font-semibold">Stock Grants</h2>
											<p className="text-sm text-muted-foreground">
												Manage grant schedules for this employee.
											</p>
										</div>
								{canManageGrants ? (
									<Button
										size="sm"
										onClick={() => grantsRef.current?.openCreate()}
										disabled={isGrantActionBlocked}
										title={
											isGrantActionBlocked
												? summaryQuery.isLoading || summaryQuery.isFetching
													? "Checking eligibility…"
													: "This employee is not eligible to exercise shares."
												: undefined
										}
									>
										New grant
									</Button>
								) : null}
									</div>
								</div>
								<div className="flex min-h-0 flex-1 flex-col px-6 py-4">
									{canViewGrants ? (
										<StockGrantsSection
											key={membershipId}
											ref={grantsRef}
											membershipId={membershipId}
											canManage={canManageGrants}
										/>
									) : (
										<p className="text-sm text-muted-foreground">
											You do not have access to view stock grants.
										</p>
									)}
								</div>
							</div>
						)}
					</div>
				</>
			) : (
				<div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-border/70 bg-card text-sm text-muted-foreground">
					Search for an employee to review stock summary and grants.
				</div>
			)}
		</PageContainer>
	);
}
