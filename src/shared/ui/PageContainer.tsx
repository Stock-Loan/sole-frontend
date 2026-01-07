import type { PropsWithChildren } from "react";
import { cn } from "@/shared/lib/utils";
import type { PageContainerProps } from "./types";

export function PageContainer({
	children,
	className,
	fullHeight = false,
	...props
}: PropsWithChildren<PageContainerProps>) {
	return (
		<div
			className={cn("mx-auto w-full", className, {
				"min-h-[70vh]": fullHeight,
			})}
			{...props}
		>
			{children}
		</div>
	);
}
