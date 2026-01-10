import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { StockLayout } from "./layout";
import { StockAdminPage } from "./pages/StockAdminPage";
import { StockOverviewPage } from "./pages/StockOverviewPage";
import { GrantsPage } from "./pages/GrantsPage";
import { VestingPage } from "./pages/VestingPage";

export const stockRoutes: RouteObject[] = [
	{
		element: <StockLayout />,
		children: [
			{
				index: true,
				element: (
					<RequirePermission permission="stock.dashboard.view">
						<StockOverviewPage />
					</RequirePermission>
				),
			},
			{
				path: "manage",
				element: (
					<RequirePermission
						permission={[
							"stock.vesting.view",
							"stock.eligibility.view",
						]}
						mode="all"
					>
						<StockAdminPage />
					</RequirePermission>
				),
			},
			{
				path: "grants",
				element: (
					<RequirePermission
						permission={["stock.view", "stock.manage"]}
						mode="any"
					>
						<GrantsPage />
					</RequirePermission>
				),
			},
			{
				path: "vesting",
				element: (
					<RequirePermission
						permission={["stock.view", "stock.manage"]}
						mode="any"
					>
						<VestingPage />
					</RequirePermission>
				),
			},
		],
	},
];
