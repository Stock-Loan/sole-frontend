import * as React from "react";
import * as ToolbarPrimitive from "@radix-ui/react-toolbar";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./button-variant";
import type {
	ToolbarButtonProps,
	ToolbarGroupProps,
	ToolbarProps,
	ToolbarSeparatorProps,
} from "./toolbar.types";

const Toolbar = React.forwardRef<
	React.ComponentRef<typeof ToolbarPrimitive.Root>,
	ToolbarProps
>(({ className, ...props }, ref) => (
	<ToolbarPrimitive.Root
		ref={ref}
		className={cn("flex w-full flex-wrap items-center gap-2", className)}
		{...props}
	/>
));
Toolbar.displayName = ToolbarPrimitive.Root.displayName;

const ToolbarGroup = React.forwardRef<HTMLDivElement, ToolbarGroupProps>(
	({ className, ...props }, ref) => (
		<div
			ref={ref}
			className={cn("flex items-center gap-2", className)}
			{...props}
		/>
	)
);
ToolbarGroup.displayName = "ToolbarGroup";

const ToolbarSeparator = React.forwardRef<
	React.ComponentRef<typeof ToolbarPrimitive.Separator>,
	ToolbarSeparatorProps
>(({ className, orientation = "vertical", ...props }, ref) => (
	<ToolbarPrimitive.Separator
		ref={ref}
		orientation={orientation}
		className={cn(
			"bg-border",
			orientation === "vertical" ? "mx-1 h-4 w-px" : "my-1 h-px w-full",
			className
		)}
		{...props}
	/>
));
ToolbarSeparator.displayName = ToolbarPrimitive.Separator.displayName;

const ToolbarButton = React.forwardRef<
	React.ComponentRef<typeof ToolbarPrimitive.Button>,
	ToolbarButtonProps
>(({ className, variant = "ghost", size = "sm", ...props }, ref) => (
	<ToolbarPrimitive.Button
		ref={ref}
		className={cn(buttonVariants({ variant, size }), "h-8 px-2", className)}
		{...props}
	/>
));
ToolbarButton.displayName = ToolbarPrimitive.Button.displayName;

export { Toolbar, ToolbarButton, ToolbarGroup, ToolbarSeparator };
