import type * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";
import type { ButtonProps } from "../Button.types";

export type DialogSize = "sm" | "md" | "lg";

export interface DialogContentProps
	extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
	size?: DialogSize;
}

export type DialogAction = {
	label: string;
	onClick?: () => void;
	variant?: ButtonProps["variant"];
	type?: "button" | "submit";
	form?: string;
	loading?: boolean;
	disabled?: boolean;
};

export interface AppDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	children: React.ReactNode;
	trigger?: React.ReactNode;
	onCancel?: () => void;
	actions?: DialogAction[];
}

export type SideModalAction = {
	label: string;
	onClick?: () => void;
	variant?: ButtonProps["variant"];
	type?: "button" | "submit";
	form?: string;
	disabled?: boolean;
	loading?: boolean;
};

export interface SideModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	title: string;
	description?: string;
	trigger?: React.ReactNode;
	children: React.ReactNode;
	actions?: SideModalAction[];
	onCancel?: () => void;
}
