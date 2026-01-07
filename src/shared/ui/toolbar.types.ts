import type * as React from "react";
import type * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import type { VariantProps } from "class-variance-authority";
import type { buttonVariants } from "./button-variant";

export type ToolbarProps = React.ComponentPropsWithoutRef<
	typeof ToolbarPrimitive.Root
>;

export type ToolbarGroupProps = React.HTMLAttributes<HTMLDivElement>;

export type ToolbarSeparatorProps = React.ComponentPropsWithoutRef<
	typeof ToolbarPrimitive.Separator
>;

export type ToolbarButtonProps = React.ComponentPropsWithoutRef<
	typeof ToolbarPrimitive.Button
> &
	VariantProps<typeof buttonVariants>;
