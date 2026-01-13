import {
	createContext,
	createElement,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useState,
} from "react";
import type { PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { setTenantResolver } from "@/shared/api/http";
import { useAuth } from "@/auth/hooks";
import { tenancyKeys } from "@/features/tenancy/keys";
import type { OrgSummary, PersistedTenancy, TenantContextValue } from "./types";
import { listTenants } from "./tenantApi";

const STORAGE_KEY = "sole.tenancy";

function loadPersistedTenancy(): PersistedTenancy {
	if (typeof localStorage === "undefined") {
		return { orgs: [], currentOrgId: null };
	}
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) {
			return { orgs: [], currentOrgId: null };
		}
		const parsed = JSON.parse(raw) as PersistedTenancy;
		return {
			orgs: Array.isArray(parsed?.orgs) ? parsed.orgs : [],
			currentOrgId: parsed?.currentOrgId ?? null,
		};
	} catch (error) {
		console.warn("Failed to load tenancy from storage", error);
		return { orgs: [], currentOrgId: null };
	}
}

function persistTenancy(state: PersistedTenancy) {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch (error) {
		console.warn("Failed to persist tenancy", error);
	}
}

function clearTenancy() {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.removeItem(STORAGE_KEY);
	} catch (error) {
		console.warn("Failed to clear tenancy", error);
	}
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: PropsWithChildren) {
	const { user, tokens } = useAuth();
	const persisted = loadPersistedTenancy();
	const fallbackOrgId = user?.org_id ?? user?.orgIds?.[0] ?? null;

	const [orgs, setOrgs] = useState<OrgSummary[]>(() => {
		if (persisted.orgs.length) {
			return persisted.orgs;
		}
		if (user?.org_id) {
			return [{ id: user.org_id, name: user.org_id }];
		}
		return [];
	});

	const [currentOrgId, setCurrentOrgId] = useState<string | null>(
		() => persisted.currentOrgId ?? fallbackOrgId ?? null
	);
	const resolvedOrgId = currentOrgId ?? fallbackOrgId;

	const tenantsQuery = useQuery({
		queryKey: tenancyKeys.tenants(),
		queryFn: listTenants,
		enabled: Boolean(tokens?.access_token && resolvedOrgId),
	});

	useLayoutEffect(() => {
		if (!currentOrgId && fallbackOrgId) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setCurrentOrgId(fallbackOrgId);
		}
	}, [currentOrgId, fallbackOrgId]);

	useLayoutEffect(() => {
		setTenantResolver(() => resolvedOrgId);
	}, [resolvedOrgId]);

	useEffect(() => {
		if (!user) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setOrgs([]);
			setCurrentOrgId(null);
			clearTenancy();
			return;
		}

		if (!currentOrgId && user.org_id) {
			setCurrentOrgId(user.org_id);
		}
	}, [user, currentOrgId]);

	useEffect(() => {
		if (tenantsQuery.data) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setOrgs(tenantsQuery.data);
			if (tenantsQuery.data.length > 0) {
				const hasCurrent = tenantsQuery.data.some(
					(org) => org.id === currentOrgId
				);
				if (!currentOrgId || !hasCurrent) {
					setCurrentOrgId(tenantsQuery.data[0].id);
				}
			}
		}
	}, [tenantsQuery.data, currentOrgId]);

	useEffect(() => {
		if (!user) return;
		persistTenancy({ orgs, currentOrgId });
	}, [orgs, currentOrgId, user]);

	const value = useMemo<TenantContextValue>(
		() => ({
			orgs,
			currentOrgId,
			setCurrentOrgId,
			setOrgs,
			isLoading: tenantsQuery.isLoading,
		}),
		[orgs, currentOrgId, tenantsQuery.isLoading]
	);

	return createElement(TenantContext.Provider, { value }, children);
}

export function useTenantContext() {
	const ctx = useContext(TenantContext);
	if (!ctx) {
		throw new Error("useTenantContext must be used within a TenantProvider");
	}
	return ctx;
}
