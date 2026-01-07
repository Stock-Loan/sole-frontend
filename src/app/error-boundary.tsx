import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ErrorPage } from "@/features/system/pages/ErrorPage";
import { routes } from "@/shared/lib/routes";

export function AppErrorBoundary() {
	const error = useRouteError();

	const title = isRouteErrorResponse(error)
		? `Error ${error.status}`
		: "Something went wrong";

	const description = isRouteErrorResponse(error)
		? error.data || error.statusText
		: (error as Error)?.message || "An unexpected error occurred.";

	return (
		<ErrorPage
			title={title}
			description={description}
			onAction={() => window.location.assign(routes.root)}
		/>
	);
}
