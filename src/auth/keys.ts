export const authKeys = {
	me: () => ["auth", "me"] as const,
	selfProfile: () => ["auth", "self-profile"] as const,
	selfContext: (orgId?: string | null) =>
		["auth", "self-context", orgId ?? "current"] as const,
};
