import { useQuery, type UseQueryOptions } from "@tanstack/react-query";
import { authKeys } from "@/auth/constants";
import { getUserSettings } from "./api/userSettings.api";
import type { UserSettingsProfile } from "./types";

export function useUserSettings(
	options: Omit<
		UseQueryOptions<UserSettingsProfile>,
		"queryKey" | "queryFn"
	> = {},
) {
	return useQuery({
		queryKey: authKeys.selfProfile(),
		queryFn: getUserSettings,
		staleTime: 5 * 60 * 1000,
		...options,
	});
}
