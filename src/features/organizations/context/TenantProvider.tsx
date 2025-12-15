import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import { setTenantResolver } from "@/lib/apiClient";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type { OrgSummary, TenantContextValue } from "../types";
import { TenantContext } from "../hooks/useTenant";

export function TenantProvider({ children }: PropsWithChildren) {
	const [orgs, setOrgs] = useState<OrgSummary[]>([]);
	const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
	const { user } = useAuth();

	useEffect(() => {
		if (!user?.org_id) return;
		setCurrentOrgId((prev) => prev ?? user.org_id ?? null);
		if (!orgs.length) {
			setOrgs([{ id: user.org_id, name: user.org_id }]);
		}
	}, [user?.org_id, orgs.length]);

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
