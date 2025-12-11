import { useTenantContext } from "../context/TenantProvider";

export function useTenant() {
	return useTenantContext();
}
