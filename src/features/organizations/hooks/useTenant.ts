import { useContext } from "react";
import { createContext } from "react";
import type { TenantContextValue } from "../types";

export const TenantContext = createContext<TenantContextValue | undefined>(
	undefined
);

export function useTenantContext() {
	const ctx = useContext(TenantContext);
	if (!ctx) {
		throw new Error("useTenantContext must be used within a TenantProvider");
	}
	return ctx;
}

export function useTenant() {
	return useTenantContext();
}
