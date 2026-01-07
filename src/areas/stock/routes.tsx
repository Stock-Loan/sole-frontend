import type { RouteObject } from "react-router-dom";
import { StockAdminPage } from "./pages/StockAdminPage";
import { GrantsPage } from "./pages/GrantsPage";
import { VestingPage } from "./pages/VestingPage";

export const stockRoutes: RouteObject[] = [
	{ index: true, element: <StockAdminPage /> },
	{ path: "grants", element: <GrantsPage /> },
	{ path: "vesting", element: <VestingPage /> },
];
