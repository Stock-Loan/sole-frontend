export const orgSettingsKeys = {
	get: () => ["org-settings", "get"] as const,
	update: (payload?: unknown) => ["org-settings", "update", payload ?? {}] as const,
};
