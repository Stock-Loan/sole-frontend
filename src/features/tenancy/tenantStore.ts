import {
	createContext,
	createElement,
	useCallback,
	useContext,
	useEffect,
	useLayoutEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { isAxiosError } from "axios";
import type { PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { setOrgResolver } from "@/shared/api/http";
import { queryClient } from "@/shared/api/queryClient";
import { useAuth } from "@/auth/hooks";
import { getMeWithToken, refreshSessionForOrgSwitch } from "@/auth/api";
import { isRefreshAuthFailure } from "@/shared/api/refresh";
import { isAuthTransitionInProgress } from "@/auth/transition";
import { tenancyKeys } from "@/features/tenancy/keys";
import type { OrgSummary, PersistedTenancy, TenantContextValue } from "./types";
import type { TokenPair } from "@/auth/types";
import { listTenants } from "./tenantApi";
import { routes } from "@/shared/lib/routes";

const STORAGE_KEY = "sole.tenancy";
const PENDING_ORG_SWITCH_KEY = "sole.pending-org-switch";

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

function savePendingOrgSwitch(orgId: string) {
	if (typeof localStorage === "undefined") return;
	localStorage.setItem(PENDING_ORG_SWITCH_KEY, orgId);
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

function isAuthFailure(error: unknown): boolean {
	if (!isAxiosError(error)) return false;
	const status = error.response?.status;
	return status === 400 || status === 401 || status === 403 || status === 404;
}

export function TenantProvider({ children }: PropsWithChildren) {
	const { user, tokens, setSessionForOrg, getTokensForOrg } = useAuth();
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
		() => persisted.currentOrgId ?? fallbackOrgId ?? null,
	);
	const resolvedOrgId = currentOrgId ?? fallbackOrgId;
	const lastOrgIdRef = useRef<string | null>(resolvedOrgId);

	const tenantsQuery = useQuery({
		queryKey: tenancyKeys.tenants(),
		queryFn: listTenants,
		enabled: Boolean(tokens?.access_token && resolvedOrgId),
	});

	useLayoutEffect(() => {
		if (!currentOrgId && fallbackOrgId) {
			setCurrentOrgId(fallbackOrgId);
		}
	}, [currentOrgId, fallbackOrgId]);

	useLayoutEffect(() => {
		setOrgResolver(() => resolvedOrgId);
	}, [resolvedOrgId]);

	useEffect(() => {
		const previous = lastOrgIdRef.current;
		if (!previous || !resolvedOrgId || previous === resolvedOrgId) {
			lastOrgIdRef.current = resolvedOrgId ?? null;
			return;
		}

		lastOrgIdRef.current = resolvedOrgId ?? null;
		void queryClient.invalidateQueries({ refetchType: "active" });
	}, [resolvedOrgId]);

	useEffect(() => {
		const data = tenantsQuery.data;
		if (!data) return;

		if (orgs.length > 1) {
			const resolvedOrg = data[0];
			if (resolvedOrg) {
				setOrgs((prev) => {
					const hasOrg = prev.some((org) => org.id === resolvedOrg.id);
					if (hasOrg) {
						return prev.map((org) =>
							org.id === resolvedOrg.id ? { ...org, ...resolvedOrg } : org,
						);
					}
					return [...prev, resolvedOrg];
				});
			}
			if (!currentOrgId && resolvedOrg) {
				setCurrentOrgId(resolvedOrg.id);
			}
			return;
		}

		setOrgs(data);
		if (data.length > 0) {
			const hasCurrent = data.some((org) => org.id === currentOrgId);
			if (!currentOrgId || !hasCurrent) {
				setCurrentOrgId(data[0].id);
			}
		}
	}, [tenantsQuery.data, currentOrgId, orgs.length]);

	const switchOrg = useCallback(
		(orgId: string) => {
			void (async () => {
				if (orgId === currentOrgId) return;
				if (!user) {
					savePendingOrgSwitch(orgId);
					window.location.assign(routes.login);
					return;
				}

				try {
					let nextTokens: TokenPair | null = getTokensForOrg(orgId);

					if (!nextTokens) {
						const refreshed = await refreshSessionForOrgSwitch(orgId);
						if (!refreshed?.access_token) {
							throw new Error("Missing access token");
						}
						nextTokens = {
							access_token: refreshed.access_token,
							token_type: "bearer",
						};
						if (refreshed.csrf_token !== undefined) {
							nextTokens.csrf_token = refreshed.csrf_token;
						}
					}

					const orgUser = await getMeWithToken(nextTokens.access_token, orgId);
					setSessionForOrg(orgId, nextTokens, orgUser);
					setCurrentOrgId(orgId);
				} catch (error) {
					if (isAuthTransitionInProgress()) {
						return;
					}
					if (!isRefreshAuthFailure(error) && !isAuthFailure(error)) {
						console.warn("Temporary org switch failure", error);
						return;
					}
					savePendingOrgSwitch(orgId);
					window.location.assign(routes.login);
				}
			})();
		},
		[currentOrgId, getTokensForOrg, setSessionForOrg, user],
	);

	useEffect(() => {
		persistTenancy({ orgs, currentOrgId });
	}, [orgs, currentOrgId]);

	const value = useMemo<TenantContextValue>(
		() => ({
			orgs,
			currentOrgId,
			setCurrentOrgId,
			switchOrg,
			setOrgs,
			isLoading: tenantsQuery.isLoading,
		}),
		[orgs, currentOrgId, tenantsQuery.isLoading, switchOrg],
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
