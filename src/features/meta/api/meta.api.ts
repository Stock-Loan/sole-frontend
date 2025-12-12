import { apiClient } from "@/lib/apiClient";
import type {
	TimezoneId,
	TimezoneListResponse,
	CountriesResponse,
	Country,
	SubdivisionsResponse,
	Subdivision,
} from "../types";

export async function getTimezones(): Promise<TimezoneId[]> {
	const { data } = await apiClient.get<TimezoneListResponse>("/meta/timezones");
	if (data && Array.isArray(data.timezones)) {
		return data.timezones;
	}
	return [];
}

export async function getCountries(): Promise<Country[]> {
	const { data } = await apiClient.get<CountriesResponse>("/meta/countries");
	if (data && Array.isArray(data.countries)) {
		return data.countries;
	}
	return [];
}

export async function getSubdivisions(countryCode: string): Promise<Subdivision[]> {
	if (!countryCode) return [];
	const { data } = await apiClient.get<SubdivisionsResponse>(
		`/meta/countries/${countryCode}/subdivisions`,
	);
	if (data && Array.isArray(data.subdivisions)) {
		return data.subdivisions;
	}
	return [];
}
