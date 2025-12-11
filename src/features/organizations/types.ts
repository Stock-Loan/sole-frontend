export type TenancyMode = "single" | "multi";

export interface OrgSummary {
	id: string;
	name: string;
	slug?: string;
	status?: "active" | "inactive" | "suspended";
}
