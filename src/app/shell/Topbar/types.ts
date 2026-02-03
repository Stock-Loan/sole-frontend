export interface TopbarProps {
	onToggleSidebar?: () => void;
}

export interface UserDropdownProps {
	showChevron?: boolean;
}

export interface RouteHandle {
	search?: {
		title: string;
		description?: string;
		category?: string;
		path?: string;
		permissions?: string | string[];
		hidden?: boolean;
	};
}

export interface SearchItemWithAccess {
	title: string;
	description: string;
	category: string;
	path: string;
	permissions?: string | string[];
}
