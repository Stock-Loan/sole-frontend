export const metaKeys = {
	timezones: () => ["meta", "timezones"] as const,
	countries: () => ["meta", "countries"] as const,
	subdivisions: (countryCode: string) =>
		["meta", "subdivisions", countryCode] as const,
};
