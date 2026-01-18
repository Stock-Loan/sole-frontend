import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { TemplatesPage } from "./pages/TemplatesPage";
import { PacketsPage } from "./pages/PacketsPage";

export const documentsRoutes: RouteObject[] = [
	{
		index: true,
		element: (
			<RequirePermission permission="org.document.view">
				<TemplatesPage />
			</RequirePermission>
		),
	},
	{
		path: "templates",
		element: (
			<RequirePermission permission="org.document.view">
				<TemplatesPage />
			</RequirePermission>
		),
	},
	{
		path: "packets",
		element: (
			<RequirePermission permission="org.document.view">
				<PacketsPage />
			</RequirePermission>
		),
		handle: {
			search: {
				title: "Document packets",
				description: "Manage loan document packets and bundles.",
				permissions: "org.document.view",
			},
		},
	},
];
