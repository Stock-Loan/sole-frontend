import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { setTenantResolver } from "@/lib/apiClient";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { OrgSummary, TenantContextValue } from "../types";
import { TenantContext } from "../hooks/useTenant";

export function TenantProvider({ children }: PropsWithChildren) {
	const { user } = useAuth();
	
	// Initialize state from user prop to avoid effect synchronization
	const [orgs, setOrgs] = useState<OrgSummary[]>(() => 
		user?.org_id ? [{ id: user.org_id, name: user.org_id }] : []
	);
	
	// Initialize state from user prop
	const [currentOrgId, setCurrentOrgId] = useState<string | null>(() => 
		user?.org_id ?? null
	);

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
