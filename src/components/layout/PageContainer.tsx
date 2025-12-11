import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import type { PageContainerProps } from "./types";

export function PageContainer({
	children,
	className,
	fullHeight = false,
	...props
}: PropsWithChildren<PageContainerProps>) {
	return (
		<div
			className={cn(
				"mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8",
				className,
				{
					"min-h-[70vh]": fullHeight,
				}
			)}
			{...props}
		>
			{children}
		</div>
	);
}
