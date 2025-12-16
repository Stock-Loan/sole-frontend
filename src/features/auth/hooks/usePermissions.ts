import { useAuth } from "./useAuth";
import { can as canHelper } from "@/lib/permissions";
import { useSelfContext } from "./useSelfContext";

export function usePermissions() {
	const { user } = useAuth();
	const { data: selfContext } = useSelfContext();

	const permissions = selfContext?.permissions ?? user?.permissions ?? [];
	const isSuperuser = user?.is_superuser;
	const roles =
		selfContext?.roles?.map((role) => role.name ?? role.id) ?? user?.roles ?? [];

	return {
		permissions,
		roles,
		can: (needed: string | string[]) =>
			Boolean(isSuperuser) || canHelper(permissions, needed),
	};
}
