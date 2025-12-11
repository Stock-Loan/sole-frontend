import { cn } from "@/lib/utils";
import type { PageHeaderProps } from "./types";

export function PageHeader({
	title,
	subtitle,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<div
			className={cn(
				"mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
				className
			)}
		>
			<div>
				<h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
				{subtitle ? (
					<p className="text-sm text-muted-foreground">{subtitle}</p>
				) : null}
			</div>
			{actions}
		</div>
	);
}
