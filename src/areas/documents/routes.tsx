import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { DocumentsPage } from "./pages/DocumentsPage";
import { TemplatesPage } from "./pages/TemplatesPage";
import { PacketsPage } from "./pages/PacketsPage";

export const documentsRoutes: RouteObject[] = [
	{
		index: true,
		element: (
			<RequirePermission
				permission={["loan.document.view", "loan.document.self_view"]}
				mode="any"
			>
				<DocumentsPage />
			</RequirePermission>
		),
	},
	{
		path: "templates",
		element: (
			<RequirePermission
				permission={[
					"loan.document.manage_hr",
					"loan.document.manage_finance",
					"loan.document.manage_legal",
				]}
				mode="any"
			>
				<TemplatesPage />
			</RequirePermission>
		),
	},
	{
		path: "packets",
		element: (
			<RequirePermission
				permission={[
					"loan.document.manage_hr",
					"loan.document.manage_finance",
					"loan.document.manage_legal",
				]}
				mode="any"
			>
				<PacketsPage />
			</RequirePermission>
		),
		handle: {
			search: {
				title: "Document packets",
				description: "Manage loan document packets and bundles.",
				permissions: [
					"loan.document.manage_hr",
					"loan.document.manage_finance",
					"loan.document.manage_legal",
				],
			},
		},
	},
];
