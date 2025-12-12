import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { setTenantResolver } from "@/lib/apiClient";
import type { OrgSummary, TenantContextValue } from "../types";
import { TenantContext } from "../hooks/useTenant";

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
		[orgs, currentOrgId]
	);

	return (
		<TenantContext.Provider value={value}>{children}</TenantContext.Provider>
	);
}
