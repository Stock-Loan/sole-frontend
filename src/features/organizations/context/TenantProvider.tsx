import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { setTenantResolver } from "@/lib/apiClient";
import type { OrgSummary } from "../types";

interface TenantContextValue {
	orgs: OrgSummary[];
	currentOrgId: string | null;
	setCurrentOrgId: (orgId: string | null) => void;
	setOrgs: (orgs: OrgSummary[]) => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: PropsWithChildren) {
	const [orgs, setOrgs] = useState<OrgSummary[]>([]);
	const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);

	useEffect(() => {
		setTenantResolver(() => currentOrgId);
	}, [currentOrgId]);

	const value = useMemo<TenantContextValue>(
		() => ({
			orgs,
			currentOrgId,
			setCurrentOrgId,
			setOrgs,
		}),
		[orgs, currentOrgId],
	);

	return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}

export function useTenantContext() {
	const ctx = useContext(TenantContext);
	if (!ctx) {
		throw new Error("useTenantContext must be used within a TenantProvider");
	}
	return ctx;
}
