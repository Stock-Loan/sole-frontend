import type { OrgSummary } from "@/entities/org/types";

export type TenancyMode = "single" | "multi";
export type { OrgSummary };

export interface TenantContextValue {
	orgs: OrgSummary[];
	currentOrgId: string | null;
	setCurrentOrgId: (orgId: string | null) => void;
	setOrgs: (orgs: OrgSummary[]) => void;
	isLoading: boolean;
}

export interface PersistedTenancy {
	orgs: OrgSummary[];
	currentOrgId: string | null;
}
