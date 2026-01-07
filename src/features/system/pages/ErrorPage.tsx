import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { PageContainer } from "@/shared/ui/PageContainer";
import { routes } from "@/shared/lib/routes";
import { cn } from "@/shared/lib/utils";
import type { ErrorPageProps } from "./types";

export function ErrorPage({
	title = "Something went wrong",
	description = "An unexpected error occurred.",
	actionLabel = "Return home",
	actionHref = routes.root,
	onAction,
	className,
}: ErrorPageProps) {
	return (
		<PageContainer
			className={cn(
				"flex min-h-[60vh] flex-col items-center justify-center text-center",
				className
			)}
		>
			<h1 className="text-2xl font-semibold">{title}</h1>
			<p className="mt-2 max-w-xl text-sm text-muted-foreground">
				{description}
			</p>
			<div className="mt-6">
				{onAction ? (
					<Button onClick={onAction}>{actionLabel}</Button>
				) : (
					<Button asChild>
						<Link to={actionHref}>{actionLabel}</Link>
					</Button>
				)}
			</div>
		</PageContainer>
	);
}
