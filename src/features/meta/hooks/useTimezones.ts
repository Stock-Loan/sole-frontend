import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getTimezones } from "../api/meta.api";

export function useTimezones() {
	return useQuery({
		queryKey: queryKeys.meta.timezones(),
		queryFn: getTimezones,
		staleTime: 24 * 60 * 60 * 1000,
	});
}
