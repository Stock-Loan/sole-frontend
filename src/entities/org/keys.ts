export const orgSettingsKeys = {
	get: () => ["org-settings", "get"] as const,
	update: (payload?: unknown) =>
		["org-settings", "update", payload ?? {}] as const,
	selfPolicy: () => ["org-policy", "self"] as const,
	pbgcRates: (year?: number | null) =>
		["org-settings", "pbgc-rates", year ?? "all"] as const,
	pbgcRefresh: () => ["org-settings", "pbgc-rates", "refresh"] as const,
};
