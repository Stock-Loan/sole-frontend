import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import type { ToastActionElement, ToastProps } from "@/shared/ui/toast";

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

export interface PickDocumentProps {
	file: File | null;
	onFileChange: (file: File | null) => void;
	accept?: string;
	disabled?: boolean;
	label?: string;
	helperText?: string;
	className?: string;
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
	className?: string;
}

export interface ToasterToast extends ToastProps {
	id: string;
	title?: ReactNode;
	description?: ReactNode;
	action?: ToastActionElement;
}

export type ToastStoreActionType =
	| "ADD_TOAST"
	| "UPDATE_TOAST"
	| "DISMISS_TOAST"
	| "REMOVE_TOAST";

export type ToastStoreAction =
	| {
			type: "ADD_TOAST";
			toast: ToasterToast;
	  }
	| {
			type: "UPDATE_TOAST";
			toast: Partial<ToasterToast>;
	  }
	| {
			type: "DISMISS_TOAST";
			toastId?: ToasterToast["id"];
	  }
	| {
			type: "REMOVE_TOAST";
			toastId?: ToasterToast["id"];
	  };

export interface ToastStoreState {
	toasts: ToasterToast[];
}

export type Toast = Omit<ToasterToast, "id">;
