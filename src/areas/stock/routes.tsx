import type { RouteObject } from "react-router-dom";
import { StockLayout } from "./layout";
import { StockAdminPage } from "./pages/StockAdminPage";
import { StockOverviewPage } from "./pages/StockOverviewPage";
import { GrantsPage } from "./pages/GrantsPage";
import { VestingPage } from "./pages/VestingPage";

export const stockRoutes: RouteObject[] = [
	{
		element: <StockLayout />,
		children: [
			{ index: true, element: <StockOverviewPage /> },
			{ path: "manage", element: <StockAdminPage /> },
			{ path: "grants", element: <GrantsPage /> },
			{ path: "vesting", element: <VestingPage /> },
		],
	},
];
