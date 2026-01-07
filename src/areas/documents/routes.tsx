import type { RouteObject } from "react-router-dom";
import { DocumentsPage } from "./pages/DocumentsPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { PacketsPage } from "./pages/PacketsPage";

export const documentsRoutes: RouteObject[] = [
	{ index: true, element: <DocumentsPage /> },
	{ path: "templates", element: <TemplatesPage /> },
	{ path: "packets", element: <PacketsPage /> },
];
