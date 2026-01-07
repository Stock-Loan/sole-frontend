export interface GlobalSearchProps {
	compact?: boolean;
	className?: string;
	items?: SearchItem[];
}

export interface CommandMenuProps {
	className?: string;
}

export interface SearchItem {
	title: string;
	description: string;
	category: string;
	path: string;
}
