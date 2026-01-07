export interface ErrorPageProps {
	title?: string;
	description?: string;
	actionLabel?: string;
	actionHref?: string;
	onAction?: () => void;
	className?: string;
}
