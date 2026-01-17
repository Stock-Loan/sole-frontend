import type * as React from "react";
import type * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import type { ButtonProps } from "./Button.types";

export type ToolbarProps = React.ComponentPropsWithoutRef<
	typeof ToolbarPrimitive.Root
>;

export type ToolbarGroupProps = React.HTMLAttributes<HTMLDivElement>;

export type ToolbarSeparatorProps = React.ComponentPropsWithoutRef<
	typeof ToolbarPrimitive.Separator
>;

export type ToolbarButtonProps = ButtonProps;
