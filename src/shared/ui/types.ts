import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";

export type LogoSize = "sm" | "md" | "lg";

export interface LogoProps {
	to?: string;
	className?: string;
	size?: LogoSize;
	showTagline?: boolean;
}

export const sizeClasses: Record<LogoSize, string> = {
	sm: "text-base",
	md: "text-lg",
	lg: "text-xl md:text-2xl",
};

export const dotSizeClasses: Record<LogoSize, string> = {
	sm: "text-lg",
	md: "text-xl",
	lg: "text-2xl md:text-3xl",
};

export const taglineSizeClasses: Record<LogoSize, string> = {
	sm: "text-[10px] md:text-xs",
	md: "text-xs md:text-sm",
	lg: "text-sm md:text-base",
};

export interface EmptyStateProps {
	title?: string;
	message: string;
	actionLabel?: string;
	onRetry?: () => void;
	icon?: ReactNode;
	className?: string;
}
export interface DataTableProps<T> {
	data: T[];
	columns: DataTableColumn<T>[];
	isLoading?: boolean;
	emptyMessage?: string;
	getRowId?: (item: T) => string;
}
export interface DataTableColumn<T> {
	header: string;
	render: (item: T) => ReactNode;
	className?: string;
}
export interface LoadingStateProps {
	label?: string;
	className?: string;
}
export interface PageHeaderProps {
	title: string;
	subtitle?: string;
	actions?: ReactNode;
	className?: string;
}

export interface PageContainerProps extends HTMLAttributes<HTMLDivElement> {
	fullHeight?: boolean;
}

export interface PublicHeaderProps {
	actions?: ReactNode;
}

export interface FilterBarProps {
	children: ReactNode;
	className?: string;
}

export type SearchInputProps = InputHTMLAttributes<HTMLInputElement>;

export interface TabButtonProps<T extends string> {
	label: string;
	value: T;
	active: boolean;
	onSelect: (value: T) => void;
}
