import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import { useTenant } from "@/features/organizations/hooks/useTenant";
import { getSelfContext } from "../api/auth.api";
import { queryKeys } from "@/lib/queryKeys";

export function useSelfContext() {
	const { tokens } = useAuth();
	const { currentOrgId } = useTenant();

	const query = useQuery({
		queryKey: queryKeys.auth.selfContext(currentOrgId),
		queryFn: getSelfContext,
		enabled: Boolean(tokens?.access_token),
		staleTime: 5 * 60 * 1000,
	});

	return query;
}
