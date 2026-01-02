import { apiClient } from "@/lib/apiClient";
import { unwrapApiResponse } from "@/lib/api-response";
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
	const payload = unwrapApiResponse<TimezoneListResponse>(data);
	if (payload && Array.isArray(payload.timezones)) {
		return payload.timezones;
	}
	return [];
}

export async function getCountries(): Promise<Country[]> {
	const { data } = await apiClient.get<CountriesResponse>("/meta/countries");
	const payload = unwrapApiResponse<CountriesResponse>(data);
	if (payload && Array.isArray(payload.countries)) {
		return payload.countries;
	}
	return [];
}

export async function getSubdivisions(countryCode: string): Promise<Subdivision[]> {
	if (!countryCode) return [];
	const { data } = await apiClient.get<SubdivisionsResponse>(
		`/meta/countries/${countryCode}/subdivisions`,
	);
	const payload = unwrapApiResponse<SubdivisionsResponse>(data);
	if (payload && Array.isArray(payload.subdivisions)) {
		return payload.subdivisions;
	}
	return [];
}
