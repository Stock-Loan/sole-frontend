import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getCountries } from "../api/meta.api";

export function useCountries() {
	return useQuery({
		queryKey: queryKeys.meta.countries(),
		queryFn: getCountries,
		staleTime: 24 * 60 * 60 * 1000,
	});
}
