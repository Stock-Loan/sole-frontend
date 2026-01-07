import type * as DialogPrimitive from "@radix-ui/react-dialog";
import type * as React from "react";

export type SheetSide = "top" | "bottom" | "left" | "right";

export interface SheetContentProps
	extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> {
	side?: SheetSide;
}
