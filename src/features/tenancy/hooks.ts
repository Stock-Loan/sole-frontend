import { useTenantContext } from "./tenantStore";
import type { TenantContextValue } from "./types";

export function useTenant() {
	return useTenantContext();
}

export function useTenantOptional(): TenantContextValue | null {
	try {
		return useTenantContext();
	} catch {
		return null;
	}
}
