import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { stockGrantKeys } from "@/entities/stock-grant/keys";
import { meKeys } from "@/shared/api/queryKeys";
import {
	createStockGrant,
	getOrgStockDashboardSummary,
	getMyStockSummary,
	getStockSummary,
	listStockGrants,
	updateStockGrant,
} from "./api";
import type {
	StockGrant,
	StockGrantInput,
	StockGrantListParams,
	StockGrantListResponse,
	StockGrantUpdateInput,
	StockDashboardSummary,
	StockDashboardSummaryParams,
	StockSummary,
	StockSummaryParams,
} from "./types";

export function useStockSummary(
	membershipId: string,
	params: StockSummaryParams = {},
	options: Omit<UseQueryOptions<StockSummary>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: stockGrantKeys.summary(membershipId, params),
		queryFn: () => getStockSummary(membershipId, params),
		enabled: Boolean(membershipId) && (options.enabled ?? true),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useMeStockSummary(
	params: StockSummaryParams = {},
	options: Omit<UseQueryOptions<StockSummary>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: meKeys.stock.summary(params),
		queryFn: () => getMyStockSummary(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useOrgStockDashboardSummary(
	params: StockDashboardSummaryParams = {},
	options: Omit<
		UseQueryOptions<StockDashboardSummary>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: stockGrantKeys.dashboardSummary(params),
		queryFn: () => getOrgStockDashboardSummary(params),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useStockGrantsList(
	membershipId: string,
	params: StockGrantListParams = {},
	options: Omit<
		UseQueryOptions<StockGrantListResponse>,
		"queryKey" | "queryFn"
	> = {}
) {
	return useQuery({
		queryKey: stockGrantKeys.grants.list(membershipId, params),
		queryFn: () => listStockGrants(membershipId, params),
		enabled: Boolean(membershipId) && (options.enabled ?? true),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useAllStockGrants(
	membershipId: string,
	options: Omit<UseQueryOptions<StockGrant[]>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: stockGrantKeys.grants.all(membershipId),
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
		enabled: Boolean(membershipId) && (options.enabled ?? true),
		placeholderData: (previous) => previous,
		...options,
	});
}

export function useCreateStockGrant(
	membershipId: string,
	options: Omit<
		UseMutationOptions<StockGrant, unknown, StockGrantInput>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (payload) => createStockGrant(membershipId, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: ["stock", "grants", "list", membershipId],
			});
			queryClient.invalidateQueries({
				queryKey: stockGrantKeys.grants.all(membershipId),
			});
			queryClient.invalidateQueries({
				queryKey: stockGrantKeys.summary(membershipId),
			});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onSuccess as any)?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onError as any)?.(error, variables, context);
		},
		...options,
	});
}

export function useUpdateStockGrant(
	membershipId: string,
	options: Omit<
		UseMutationOptions<
			StockGrant,
			unknown,
			{ grantId: string; payload: StockGrantUpdateInput }
		>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({ grantId, payload }) => updateStockGrant(grantId, payload),
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({
				queryKey: ["stock", "grants", "list", membershipId],
			});
			queryClient.invalidateQueries({
				queryKey: stockGrantKeys.grants.all(membershipId),
			});
			queryClient.invalidateQueries({
				queryKey: stockGrantKeys.summary(membershipId),
			});
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onSuccess as any)?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(options.onError as any)?.(error, variables, context);
		},
		...options,
	});
}
