import type { SearchItem } from "@/features/search/types";

export type SearchItemWithAccess = SearchItem & {
	permissions?: string | string[];
};

export type RouteSearchMeta = {
	title: string;
	description?: string;
	category?: string;
	permissions?: string | string[];
	path?: string;
	hidden?: boolean;
};

export type RouteHandle = {
	search?: RouteSearchMeta;
};

export type UserDropdownProps = {
	showChevron?: boolean;
};
