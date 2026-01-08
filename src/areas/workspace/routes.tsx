import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { OverviewPage } from "./pages/OverviewPage";
import { MyLoansPage } from "./pages/MyLoansPage";
import { MyStockPage } from "./pages/MyStockPage";
import { MySettingsPage } from "./pages/MySettingsPage";

export const workspaceRoutes: RouteObject[] = [
	{
		index: true,
		element: (
			<RequirePermission permission="org.dashboard.view">
				<OverviewPage />
			</RequirePermission>
		),
	},
	{
		path: "overview",
		element: (
			<RequirePermission permission="org.dashboard.view">
				<OverviewPage />
			</RequirePermission>
		),
	},
	{
		path: "loans",
		element: (
			<RequirePermission permission="loan.view_own">
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
	},
	{ path: "settings", element: <MySettingsPage /> },
];
