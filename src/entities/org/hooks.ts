import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationOptions,
	type UseQueryOptions,
} from "@tanstack/react-query";
import { orgSettingsKeys } from "@/entities/org/keys";
import { getOrgSettings, updateOrgSettings } from "./api";
import type { OrgSettings, OrgSettingsUpdatePayload } from "./types";

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
		onSuccess: (data, variables, context) => {
			queryClient.invalidateQueries({ queryKey: orgSettingsKeys.get() });
			options.onSuccess?.(data, variables, context);
		},
		onError: (error, variables, context) => {
			options.onError?.(error, variables, context);
		},
		...options,
	});
}
