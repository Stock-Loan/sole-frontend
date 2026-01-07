import { useQuery } from "@tanstack/react-query";
import { metaKeys } from "@/entities/meta/keys";
import { getSubdivisions } from "./api";

export function useSubdivisions(countryCode: string | null) {
	return useQuery({
		enabled: Boolean(countryCode),
		queryKey: countryCode ? metaKeys.subdivisions(countryCode) : [],
		queryFn: () => getSubdivisions(countryCode || ""),
		staleTime: 24 * 60 * 60 * 1000,
	});
}
