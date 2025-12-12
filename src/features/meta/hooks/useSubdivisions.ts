import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { getSubdivisions } from "../api/meta.api";

export function useSubdivisions(countryCode: string | null) {
	return useQuery({
		enabled: Boolean(countryCode),
		queryKey: countryCode ? queryKeys.meta.subdivisions(countryCode) : [],
		queryFn: () => getSubdivisions(countryCode || ""),
		staleTime: 24 * 60 * 60 * 1000,
	});
}
