import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { OverviewPage } from "./pages/OverviewPage";
import { MyLoansPage } from "./pages/MyLoansPage";
import { MyStockPage } from "./pages/MyStockPage";
import { MySettingsPage } from "./pages/MySettingsPage";
import { MyDocumentsPage } from "./pages/MyDocumentsPage";
import { MyAmortizationPage } from "./pages/MyAmortizationPage";

export const workspaceRoutes: RouteObject[] = [
	{
		index: true,
		element: <OverviewPage />,
	},
	{
		path: "loans",
		element: (
			<RequirePermission permission={["loan.view_own", "loan.apply"]} mode="any">
				<MyLoansPage />
			</RequirePermission>
		),
	},
	{
		path: "stock",
		element: (
			<RequirePermission permission="stock.self.view">
				<MyStockPage />
			</RequirePermission>
		),
		handle: {
			search: {
				title: "My stock",
				description: "Review personal stock summaries and eligibility.",
				permissions: "stock.self.view",
			},
		},
	},
	{
		path: "documents",
		element: (
			<RequirePermission
				permission={["loan.document.self_view", "loan.document.self_upload_83b"]}
				mode="any"
			>
				<MyDocumentsPage />
			</RequirePermission>
		),
	},
	{
		path: "amortization",
		element: (
			<RequirePermission permission="loan.schedule.self.view">
				<MyAmortizationPage />
			</RequirePermission>
		),
	},
	{ path: "settings", element: <MySettingsPage /> },
];
