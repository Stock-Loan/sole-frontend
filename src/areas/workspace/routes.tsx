import type { RouteObject } from "react-router-dom";
import { OverviewPage } from "./pages/OverviewPage";
import { MyLoansPage } from "./pages/MyLoansPage";
import { MyStockPage } from "./pages/MyStockPage";
import { MySettingsPage } from "./pages/MySettingsPage";

export const workspaceRoutes: RouteObject[] = [
	{ index: true, element: <OverviewPage /> },
	{ path: "overview", element: <OverviewPage /> },
	{ path: "loans", element: <MyLoansPage /> },
	{ path: "stock", element: <MyStockPage /> },
	{ path: "settings", element: <MySettingsPage /> },
];
