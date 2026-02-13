import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { orgSettingsKeys } from "@/entities/org/keys";
import {
	createOrg,
	getOrgSettings,
	getSelfOrgPolicy,
	getPbgcRates,
	refreshPbgcRates,
	updateOrgSettings,
} from "./api";
import type {
	OrgCreatePayload,
	OrgRecord,
	OrgSettings,
	OrgSettingsUpdatePayload,
	PbgcMidTermRate,
	PbgcRateRefreshResponse,
	SelfOrgPolicy,
} from "./types";

export function useOrgSettings(
	orgId?: string | null,
	options: Omit<UseQueryOptions<OrgSettings>, "queryKey" | "queryFn"> = {},
) {
	return useQuery({
		queryKey: orgSettingsKeys.get(orgId),
		queryFn: getOrgSettings,
		...options,
	});
}

export function useUpdateOrgSettings(
	orgId?: string | null,
	options: Omit<
		UseMutationOptions<OrgSettings, unknown, OrgSettingsUpdatePayload>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateOrgSettings,
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.setQueryData(orgSettingsKeys.get(orgId), data);
			void queryClient.invalidateQueries({
				queryKey: orgSettingsKeys.get(orgId),
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useSelfOrgPolicy(
	options: Omit<UseQueryOptions<SelfOrgPolicy>, "queryKey" | "queryFn"> = {},
) {
	return useQuery({
		queryKey: orgSettingsKeys.selfPolicy(),
		queryFn: getSelfOrgPolicy,
		...options,
	});
}

export function useCreateOrg(
	options: Omit<
		UseMutationOptions<OrgRecord, unknown, OrgCreatePayload>,
		"mutationFn"
	> = {},
) {
	return useMutation({
		mutationFn: createOrg,
		...options,
	});
}

export function usePbgcRates(
	year?: number | null,
	options: Omit<
		UseQueryOptions<PbgcMidTermRate[]>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: orgSettingsKeys.pbgcRates(year ?? null),
		queryFn: () => getPbgcRates(year ?? null),
		...options,
	});
}

export function useRefreshPbgcRates(
	options: Omit<
		UseMutationOptions<PbgcRateRefreshResponse, unknown, void>,
		"mutationFn"
	> = {},
) {
	const queryClient = useQueryClient();
	return useMutation({
		...options,
		mutationFn: refreshPbgcRates,
		onSuccess: async (data, variables, onMutateResult, context) => {
			await queryClient.invalidateQueries({
				queryKey: ["org-settings", "pbgc-rates"],
			});
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
	});
}

export function toggleValue<T extends string>(
	values: T[],
	value: T,
	checked: boolean,
) {
	if (checked) return [...values, value];
	return values.filter((item) => item !== value);
}
