export type TimezoneId = string;

export interface TimezoneListResponse {
	timezones: TimezoneId[];
}

export interface Country {
	code: string;
	name: string;
}

export interface Subdivision {
	code: string;
	name: string;
}

export interface CountriesResponse {
	countries: Country[];
}

export interface SubdivisionsResponse {
	country: string;
	subdivisions: Subdivision[];
}

export interface TimezoneSelectProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	contentClassName?: string;
}
