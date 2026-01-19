import { discoverOrg, getSelfContext } from "@/auth/api";
import type { OrgSummary } from "./types";

export async function listTenants(): Promise<OrgSummary[]> {
	const context = await getSelfContext();
	if (!context?.org) return [];

	const { id, name, slug, status } = context.org;
	return [
		{
			id,
			name,
			slug,
			status: status as OrgSummary["status"],
		},
	];
}

export async function discoverTenants(email: string): Promise<OrgSummary[]> {
	return discoverOrg({ email });
}
