import {
	forwardRef,
	useCallback,
	useImperativeHandle,
	useMemo,
	useState,
} from "react";
import { useNavigate } from "react-router-dom";
import type { PaginationState, VisibilityState } from "@tanstack/react-table";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/Button";
import { DataTable } from "@/shared/ui/Table/DataTable";
import type { ColumnDefinition } from "@/shared/ui/Table/types";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import { formatCurrency, formatDate } from "@/shared/lib/format";
import { usePermissions, useAuth } from "@/auth/hooks";
import { formatShares } from "@/entities/stock-grant/constants";
import { routes } from "@/shared/lib/routes";
import {
	useCreateStockGrant,
	useStockGrantsList,
	useStockSummary,
	useUpdateStockGrant,
} from "../hooks";
import { StockGrantDialog } from "./StockGrantDialog";
import type {
	GrantSummary,
	StockGrant,
	StockGrantFormMode,
	StockGrantFormValues,
	StockGrantUpdateInput,
	StockGrantsSectionHandle,
	StockGrantsSectionProps,
} from "../types";

function getGrantSummary(
	grant: StockGrant,
	summaryMap: Map<string, GrantSummary>,
) {
	const summary = summaryMap.get(grant.id);
	if (summary) {
		return {
			vested: summary.vested_shares,
			unvested: summary.unvested_shares,
			reserved: summary.reserved_shares ?? null,
			available: summary.available_vested_shares ?? null,
		};
	}
	return {
		vested: grant.vested_shares ?? null,
		unvested: grant.unvested_shares ?? null,
		reserved: grant.reserved_shares ?? null,
		available: grant.available_vested_shares ?? null,
	};
}

export const StockGrantsSection = forwardRef<
	StockGrantsSectionHandle,
	StockGrantsSectionProps
>(function StockGrantsSection(
	{ membershipId, canManage, isGrantActionBlocked = false },
	ref,
) {
	const navigate = useNavigate();
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const { can } = usePermissions();
	const canViewSummary = can(["stock.vesting.view", "stock.eligibility.view"]);
	const { user } = useAuth();

	const [dialogOpen, setDialogOpen] = useState(false);
	const [dialogMode, setDialogMode] = useState<StockGrantFormMode>("create");
	const [editingGrant, setEditingGrant] = useState<StockGrant | null>(null);
	const [paginationState, setPaginationState] = useState<PaginationState>({
		pageIndex: 0,
		pageSize: 10,
	});

	const preferencesConfig = useMemo(
		() => ({
			id: `stock-grants-${membershipId}`,
			scope: "user" as const,
			userKey: user?.id ?? null,
			orgKey: user?.org_id ?? null,
			version: 1,
		}),
		[membershipId, user?.id, user?.org_id],
	);

	const listParams = useMemo(
		() => ({
			page: paginationState.pageIndex + 1,
			page_size: paginationState.pageSize,
		}),
		[paginationState.pageIndex, paginationState.pageSize],
	);

	const grantsQuery = useStockGrantsList(membershipId, listParams, {
		enabled: Boolean(membershipId),
	});

	const summaryQuery = useStockSummary(
		membershipId,
		{},
		{
			enabled: Boolean(membershipId) && canViewSummary,
		},
	);

	const grants = grantsQuery.data?.items ?? [];
	const totalRows = grantsQuery.data?.total ?? grants.length;
	const totalPages = Math.max(
		1,
		Math.ceil(totalRows / paginationState.pageSize),
	);
	const summaryMap = useMemo(() => {
		const map = new Map<string, GrantSummary>();
		(summaryQuery.data?.grants ?? []).forEach((grant) => {
			map.set(grant.grant_id, grant);
		});
		return map;
	}, [summaryQuery.data?.grants]);

	const createMutation = useCreateStockGrant(membershipId, {
		onSuccess: () => {
			toast({ title: "Stock grant created" });
			setDialogOpen(false);
			setPaginationState((prev) => ({ ...prev, pageIndex: 0 }));
			grantsQuery.refetch();
			summaryQuery.refetch();
		},
		onError: (error) => apiErrorToast(error, "Unable to create stock grant."),
	});

	const updateMutation = useUpdateStockGrant(membershipId, {
		onSuccess: () => {
			toast({ title: "Stock grant updated" });
			setDialogOpen(false);
			setEditingGrant(null);
		},
		onError: (error) => apiErrorToast(error, "Unable to update stock grant."),
	});

	const handleOpenCreate = useCallback(() => {
		setDialogMode("create");
		setEditingGrant(null);
		setDialogOpen(true);
	}, []);

	const handleOpenEdit = useCallback((grant: StockGrant) => {
		setDialogMode("edit");
		setEditingGrant(grant);
		setDialogOpen(true);
	}, []);

	const handleDialogChange = useCallback((open: boolean) => {
		setDialogOpen(open);
		if (!open) {
			setEditingGrant(null);
		}
	}, []);

	const buildPayload = useCallback((values: StockGrantFormValues) => {
		const vestingEvents =
			values.vesting_strategy === "SCHEDULED"
				? values.vesting_events.map((event) => ({
						vest_date: event.vest_date,
						shares: event.shares,
					}))
				: undefined;

		return {
			notes: values.notes?.trim() || null,
			vesting_events: vestingEvents,
		};
	}, []);

	const handleSubmit = async (values: StockGrantFormValues) => {
		if (dialogMode === "create") {
			await createMutation.mutateAsync({
				grant_date: values.grant_date,
				total_shares: values.total_shares,
				exercise_price: values.exercise_price,
				vesting_strategy: values.vesting_strategy,
				notes: values.notes?.trim() || null,
				vesting_events:
					values.vesting_strategy === "SCHEDULED"
						? values.vesting_events.map((event) => ({
								vest_date: event.vest_date,
								shares: event.shares,
							}))
						: undefined,
			});
			return;
		}

		if (!editingGrant) return;
		const payload: StockGrantUpdateInput = {
			status: values.status ?? editingGrant.status,
			...buildPayload(values),
		};
		await updateMutation.mutateAsync({
			grantId: editingGrant.id,
			payload,
		});
	};

	const isSubmitting = createMutation.isPending || updateMutation.isPending;

	useImperativeHandle(
		ref,
		() => ({
			openCreate: handleOpenCreate,
		}),
		[handleOpenCreate],
	);

	const columns = useMemo<ColumnDefinition<StockGrant>[]>(() => {
		const getVestingText = (grant: StockGrant) => {
			const summary = getGrantSummary(grant, summaryMap);
			if (summary.vested === null && summary.unvested === null) {
				return "—";
			}
			return `${formatShares(summary.vested)} vested / ${formatShares(
				summary.unvested,
			)} unvested`;
		};

		const getReservedShares = (grant: StockGrant) => {
			const summary = getGrantSummary(grant, summaryMap);
			return summary.reserved ?? grant.reserved_shares ?? null;
		};

		const getAvailableVestedShares = (grant: StockGrant) => {
			const summary = getGrantSummary(grant, summaryMap);
			return summary.available ?? grant.available_vested_shares ?? null;
		};

		const getExercisePriceNumber = (value?: string | null) => {
			if (!value) return null;
			const numeric = Number(value.replace(/,/g, "").trim());
			return Number.isFinite(numeric) ? numeric : null;
		};

		const getGrantValue = (grant: StockGrant) => {
			const price = getExercisePriceNumber(grant.exercise_price);
			if (price === null) return null;
			return price * (grant.total_shares ?? 0);
		};

		const getVestingEventsText = (grant: StockGrant) => {
			const events = grant.vesting_events ?? [];
			if (events.length === 0) return "—";
			return events
				.map((event) => {
					const date = formatDate(event.vest_date);
					const shares = formatShares(event.shares);
					return `${date} (${shares})`;
				})
				.join("; ");
		};

		const getNextVestingText = (grant: StockGrant) => {
			if (!grant.next_vesting_event) return "—";
			const date = formatDate(grant.next_vesting_event.vest_date);
			const shares = formatShares(grant.next_vesting_event.shares);
			return `${date} (${shares})`;
		};

		const baseColumns: ColumnDefinition<StockGrant>[] = [
			{
				id: "id",
				header: "Grant ID",
				accessor: (grant) => grant.id ?? "",
			},
			{
				id: "orgId",
				header: "Org ID",
				accessor: (grant) => grant.org_id ?? "",
			},
			{
				id: "orgMembershipId",
				header: "Membership ID",
				accessor: (grant) => grant.org_membership_id ?? "",
			},
			{
				id: "grantDate",
				header: "Grant date",
				accessor: (grant) => grant.grant_date ?? "",
				sortAccessor: (grant) =>
					grant.grant_date ? new Date(grant.grant_date).getTime() : 0,
				cell: (grant) => formatDate(grant.grant_date),
			},
			{
				id: "totalShares",
				header: "Total shares",
				accessor: (grant) => grant.total_shares ?? 0,
				cell: (grant) => formatShares(grant.total_shares),
			},
			{
				id: "exercisePrice",
				header: "Exercise price",
				accessor: (grant) => grant.exercise_price ?? "",
				sortAccessor: (grant) =>
					getExercisePriceNumber(grant.exercise_price) ?? 0,
				cell: (grant) =>
					grant.exercise_price ? formatCurrency(grant.exercise_price) : "—",
				cellClassName: "whitespace-nowrap",
			},
			{
				id: "grantValue",
				header: "Grant value",
				accessor: getGrantValue,
				sortAccessor: (grant) => getGrantValue(grant) ?? 0,
				cell: (grant) => {
					const value = getGrantValue(grant);
					return value === null ? "—" : formatCurrency(value);
				},
				headerClassName: "text-right",
				cellClassName: "text-right",
			},
			{
				id: "vestingStrategy",
				header: "Vesting strategy",
				accessor: (grant) => grant.vesting_strategy ?? "",
				cellClassName: "whitespace-nowrap",
			},
			{
				id: "vesting",
				header: "Vesting",
				accessor: getVestingText,
				cell: (grant) => (
					<span className="text-muted-foreground">{getVestingText(grant)}</span>
				),
				enableSorting: false,
			},
			{
				id: "vestingEvents",
				header: "Vesting events",
				accessor: getVestingEventsText,
				cell: (grant) => getVestingEventsText(grant),
				enableSorting: false,
			},
			{
				id: "vestedShares",
				header: "Vested shares",
				accessor: (grant) => grant.vested_shares ?? 0,
				cell: (grant) => formatShares(grant.vested_shares),
			},
			{
				id: "reservedShares",
				header: "Reserved shares",
				accessor: (grant) => getReservedShares(grant) ?? 0,
				cell: (grant) => formatShares(getReservedShares(grant)),
			},
			{
				id: "availableVestedShares",
				header: "Available vested shares",
				accessor: (grant) => getAvailableVestedShares(grant) ?? 0,
				cell: (grant) => formatShares(getAvailableVestedShares(grant)),
			},
			{
				id: "unvestedShares",
				header: "Unvested shares",
				accessor: (grant) => grant.unvested_shares ?? 0,
				cell: (grant) => formatShares(grant.unvested_shares),
			},
			{
				id: "nextVestingEvent",
				header: "Next vesting event",
				accessor: getNextVestingText,
				sortAccessor: (grant) =>
					grant.next_vesting_event?.vest_date
						? new Date(grant.next_vesting_event.vest_date).getTime()
						: 0,
				cell: (grant) => getNextVestingText(grant),
			},
			{
				id: "nextVestingSummary",
				header: "Next vesting summary",
				accessor: (grant) => grant.next_vesting_summary ?? "",
				cell: (grant) => grant.next_vesting_summary || "—",
				enableSorting: false,
			},
			{
				id: "status",
				header: "Status",
				accessor: (grant) => grant.status ?? "",
				cell: (grant) => (
					<Badge
						variant="secondary"
						className={
							grant.status === "ACTIVE"
								? "border-emerald-200 bg-emerald-50 text-emerald-700"
								: grant.status === "EXERCISED_OUT"
									? "border-amber-200 bg-amber-50 text-amber-700"
									: "border-border bg-muted text-muted-foreground"
						}
					>
						{grant.status}
					</Badge>
				),
			},
			{
				id: "notes",
				header: "Notes",
				accessor: (grant) => grant.notes ?? "",
				cell: (grant) => grant.notes || "—",
				enableSorting: false,
			},
		];

		return baseColumns;
	}, [summaryMap]);

	const initialColumnVisibility = useMemo<VisibilityState>(
		() => ({
			id: false,
			orgId: false,
			orgMembershipId: false,
			vestingEvents: false,
			nextVestingSummary: false,
			notes: false,
			vestedShares: false,
			reservedShares: false,
			availableVestedShares: false,
			unvestedShares: false,
			nextVestingEvent: false,
		}),
		[],
	);

	if (grantsQuery.isError) {
		return (
			<div className="flex flex-wrap items-center gap-3 text-sm text-destructive">
				<span>Unable to load stock grants.</span>
				<Button
					variant="outline"
					size="sm"
					onClick={() => grantsQuery.refetch()}
				>
					Retry
				</Button>
			</div>
		);
	}

	return (
		<div className="flex min-h-0 flex-1 flex-col gap-4">
			<DataTable
				data={grants}
				columns={columns}
				getRowId={(grant) => grant.id}
				isLoading={grantsQuery.isLoading}
				emptyMessage="No grants yet for this employee."
				enableRowSelection={canManage}
				enableExport={true}
				onRowClick={(grant) =>
					navigate(
						routes.stockGrantDetail.replace(":grantId", grant.id),
					)
				}
				preferences={preferencesConfig}
				initialColumnVisibility={initialColumnVisibility}
				pagination={{
					enabled: true,
					mode: "server",
					state: paginationState,
					onPaginationChange: setPaginationState,
					pageCount: totalPages,
					totalRows,
				}}
				className="flex-1 min-h-0"
				headerActions={
					canManage
						? {
								primaryAction: {
									label: "New grant",
									onClick: handleOpenCreate,
									disabled: isGrantActionBlocked,
									title: isGrantActionBlocked
										? "User must have active employment and platform status to receive grants."
										: undefined,
								},
							}
						: undefined
				}
				renderToolbarActions={(selectedGrants) => {
					if (!canManage) return null;
					const hasSingle = selectedGrants.length === 1;
					const selectedGrant = hasSingle ? selectedGrants[0] : null;
					const isLocked = selectedGrant
						? selectedGrant.status === "CANCELLED" ||
							selectedGrant.status === "EXERCISED_OUT"
						: false;
					return (
						<div className="flex items-center gap-2">
							<Button
								variant="outline"
								size="sm"
								disabled={!hasSingle}
								onClick={() => {
									if (selectedGrant) {
										navigate(
											routes.stockGrantDetail.replace(
												":grantId",
												selectedGrant.id,
											),
										);
									}
								}}
							>
								View details
							</Button>
							<Button
								variant="outline"
								size="sm"
								disabled={!hasSingle || isLocked}
								onClick={() => {
									if (selectedGrant) {
										handleOpenEdit(selectedGrant);
									}
								}}
								title={
									isLocked
										? "This grant is locked and cannot be edited."
										: "Edit grant"
								}
							>
								Edit
							</Button>
						</div>
					);
				}}
			/>

			<StockGrantDialog
				open={dialogOpen}
				onOpenChange={handleDialogChange}
				mode={dialogMode}
				initialGrant={editingGrant}
				onSubmit={handleSubmit}
				isSubmitting={isSubmitting}
			/>
		</div>
	);
});

StockGrantsSection.displayName = "StockGrantsSection";
