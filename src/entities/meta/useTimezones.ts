import { useQuery } from "@tanstack/react-query";
import { metaKeys } from "@/entities/meta/keys";
import { getTimezones } from "./api";

export function useTimezones() {
	return useQuery({
		queryKey: metaKeys.timezones(),
		queryFn: getTimezones,
		staleTime: 24 * 60 * 60 * 1000,
	});
}
