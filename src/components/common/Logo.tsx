import { Link } from "react-router-dom";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import type { LogoProps } from "./types";
import { sizeClasses, dotSizeClasses, taglineSizeClasses } from "./types";

export function Logo({
	to = routes.root,
	className,
	size = "md",
	showTagline = true,
}: LogoProps) {
	return (
		<Link
			to={to}
			className={cn(
				// OUTER PILL (no hover effect)
				"inline-flex items-center gap-3 rounded-full border border-border/60 " +
					"bg-background/80 ps-2 pe-3 py-1.5 shadow-sm backdrop-blur-sm",
				className
			)}
			aria-label="Sole — equity redefined, home"
		>
			{/* INNER PILL: Sole. with dark blue background */}
			<span
				className={cn(
					"inline-flex items-center gap-1 rounded-full bg-sky-950 px-3 py-0.5 " +
						"dark:bg-sky-900"
				)}
			>
				<span
					className={cn(
						"font-semibold tracking-tight text-sky-50",
						sizeClasses[size]
					)}
				>
					Sole
				</span>

				<span
					className={cn("leading-none text-amber-400", dotSizeClasses[size])}
					aria-hidden="true"
				>
					.
				</span>
			</span>

			{/* Tagline tuned to blend with the palette */}
			{showTagline && (
				<span
					className={cn(
						"font-medium tracking-wide text-sky-900 dark:text-sky-100/80",
						taglineSizeClasses[size]
					)}
				>
					Equity Redefined
				</span>
			)}
		</Link>
	);
}
