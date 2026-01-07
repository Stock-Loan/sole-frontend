import { useQuery } from "@tanstack/react-query";
import { metaKeys } from "@/entities/meta/keys";
import { getCountries } from "./api";

export function useCountries() {
	return useQuery({
		queryKey: metaKeys.countries(),
		queryFn: getCountries,
		staleTime: 24 * 60 * 60 * 1000,
	});
}
