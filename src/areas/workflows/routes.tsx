import type { RouteObject } from "react-router-dom";
import { QueuePage } from "./pages/QueuePage";
import { RequestDetailPage } from "./pages/RequestDetailPage";

export const workflowsRoutes: RouteObject[] = [
	{ index: true, element: <QueuePage /> },
	{ path: "queue", element: <QueuePage /> },
	{ path: "requests", element: <QueuePage /> },
	{ path: "requests/:requestId", element: <RequestDetailPage /> },
];
