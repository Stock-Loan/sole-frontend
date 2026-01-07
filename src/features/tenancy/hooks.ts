import { useTenantContext } from "./tenantStore";

export function useTenant() {
	return useTenantContext();
}
