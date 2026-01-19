import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { orgSettingsKeys } from "@/entities/org/keys";
import { createOrg, getOrgSettings, getSelfOrgPolicy, updateOrgSettings } from "./api";
import type {
	OrgCreatePayload,
	OrgRecord,
	OrgSettings,
	OrgSettingsUpdatePayload,
	SelfOrgPolicy,
} from "./types";

export function useOrgSettings(
	options: Omit<UseQueryOptions<OrgSettings>, "queryKey" | "queryFn"> = {}
) {
	return useQuery({
		queryKey: orgSettingsKeys.get(),
		queryFn: getOrgSettings,
		...options,
	});
}

export function useUpdateOrgSettings(
	options: Omit<
		UseMutationOptions<OrgSettings, unknown, OrgSettingsUpdatePayload>,
		"mutationFn"
	> = {}
) {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateOrgSettings,
		onSuccess: (data, variables, onMutateResult, context) => {
			queryClient.invalidateQueries({ queryKey: orgSettingsKeys.get() });
			options.onSuccess?.(data, variables, onMutateResult, context);
		},
		onError: (error, variables, onMutateResult, context) => {
			options.onError?.(error, variables, onMutateResult, context);
		},
		...options,
	});
}

export function useSelfOrgPolicy(
	options: Omit<UseQueryOptions<SelfOrgPolicy>, "queryKey" | "queryFn"> = {}
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
	> = {}
) {
	return useMutation({
		mutationFn: createOrg,
		...options,
	});
}
