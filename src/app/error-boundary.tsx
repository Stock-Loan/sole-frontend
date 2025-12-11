import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";

export function AppErrorBoundary() {
	const error = useRouteError();

	const title = isRouteErrorResponse(error)
		? `Error ${error.status}`
		: "Something went wrong";

	const description = isRouteErrorResponse(error)
		? error.data || error.statusText
		: (error as Error)?.message || "An unexpected error occurred.";

	return (
		<PageContainer className="flex min-h-[60vh] flex-col items-center justify-center text-center">
			<h1 className="text-2xl font-semibold">{title}</h1>
			<p className="mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
			<div className="mt-6">
				<Button onClick={() => window.location.assign("/")}>Return home</Button>
			</div>
		</PageContainer>
	);
}
