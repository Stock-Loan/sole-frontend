import type { routes } from "@/shared/lib/routes";

export interface FormatCurrencyOptions {
	locale?: string;
	currency?: string;
	minimumFractionDigits?: number;
	maximumFractionDigits?: number;
}

export type AppRouteKey = Exclude<keyof typeof routes, "auth">;
export type AppRoute = (typeof routes)[AppRouteKey];
