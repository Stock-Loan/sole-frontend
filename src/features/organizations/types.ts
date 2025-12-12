export type TenancyMode = "single" | "multi";

export interface OrgSummary {
	id: string;
	name: string;
	slug?: string;
	status?: "active" | "inactive" | "suspended";
}

export interface TenantContextValue {
  orgs: OrgSummary[];
  currentOrgId: string | null;
  setCurrentOrgId: (orgId: string | null) => void;
  setOrgs: (orgs: OrgSummary[]) => void;
}