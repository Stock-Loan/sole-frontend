import { useAuth } from "./useAuth";
import { can as canHelper } from "@/lib/permissions";

export function usePermissions() {
	const { user } = useAuth();
	const permissions = user?.permissions ?? [];
	const isSuperuser = user?.is_superuser;

	return {
		permissions,
		can: (needed: string | string[]) =>
			Boolean(isSuperuser) || canHelper(permissions, needed),
	};
}
