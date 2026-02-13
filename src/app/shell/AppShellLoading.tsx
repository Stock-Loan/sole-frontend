import { Skeleton } from "@/shared/ui/Skeleton";
import { PageContainer } from "@/shared/ui/PageContainer";
import type { AppShellLoadingProps } from "./types";

export function AppShellLoading({
	label = "Loading workspace...",
}: AppShellLoadingProps) {
	return (
		<div
			className="relative flex h-[100dvh] overflow-hidden bg-muted/30 lg:px-4 lg:py-4"
			role="status"
			aria-live="polite"
			aria-busy="true"
			aria-label={label}
		>
			<aside className="hidden h-full w-[14.75rem] flex-col border border-border/60 bg-background/80 shadow-sm backdrop-blur lg:flex lg:rounded-3xl">
				<div className="space-y-2 px-3 py-5 text-center">
					<Skeleton className="h-6 w-28" />
					<Skeleton className="h-3 w-20" />
				</div>
				<div className="px-2 pb-2 text-center">
					<Skeleton className="h-3 w-16" />
				</div>
				<nav className="mx-auto mt-6 w-full max-w-[12.75rem] space-y-2 px-2">
					{Array.from({ length: 7 }).map((_, index) => (
						<div
							key={`app-shell-nav-skeleton-${index}`}
							className="flex items-center gap-3 rounded-md px-2 py-2"
						>
							<Skeleton className="h-4 w-4 rounded-sm" />
							<Skeleton className="h-4 w-24" />
						</div>
					))}
				</nav>
			</aside>

			<div className="flex min-w-0 flex-1 flex-col">
				<header className="sticky top-0 z-40 flex items-center justify-between gap-4 px-6 py-3">
					<div className="flex items-center gap-3 shrink-0">
						<Skeleton className="h-9 w-28 rounded-md" />
					</div>
					<div className="flex flex-1 items-center justify-center gap-4 px-4">
						<Skeleton className="hidden h-10 w-full max-w-md rounded-md lg:block" />
						<Skeleton className="hidden h-10 w-44 rounded-md md:block" />
					</div>
					<div className="flex items-center gap-3 shrink-0">
						<Skeleton className="h-9 w-9 rounded-full" />
						<Skeleton className="h-9 w-9 rounded-full" />
					</div>
				</header>

				<main className="min-w-0 flex-1 overflow-y-auto">
					<div className="mx-auto flex h-full w-full min-h-0 flex-col px-4 pt-4 sm:px-6 lg:px-10">
						<PageContainer className="flex min-h-0 flex-1 flex-col gap-4">
							<div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
								<div className="space-y-2">
									<Skeleton className="h-8 w-56" />
									<Skeleton className="h-4 w-80" />
								</div>
								<Skeleton className="h-9 w-28 rounded-md" />
							</div>

							<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
								{Array.from({ length: 4 }).map((_, index) => (
									<div
										key={`app-shell-metric-skeleton-${index}`}
										className="rounded-lg border bg-card p-4 shadow-sm"
									>
										<Skeleton className="h-3 w-24" />
										<Skeleton className="mt-3 h-7 w-24" />
									</div>
								))}
							</div>

							<div className="rounded-lg border bg-card p-4 shadow-sm">
								<div className="mb-4 flex items-center justify-between">
									<Skeleton className="h-4 w-36" />
									<Skeleton className="h-9 w-24" />
								</div>
								<div className="space-y-2">
									{Array.from({ length: 6 }).map((_, index) => (
										<Skeleton
											key={`app-shell-table-row-skeleton-${index}`}
											className="h-10 w-full"
										/>
									))}
								</div>
							</div>
						</PageContainer>
					</div>
				</main>
			</div>
		</div>
	);
}
