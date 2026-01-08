import { Navigate, Outlet, type RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { TenancyAdminPage } from "./pages/TenancyAdminPage";
import { FeatureFlagsPage } from "./pages/FeatureFlagsPage";

export const adminRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="tenancy" replace /> },
	{
		element: (
			<RequirePermission permission="system.admin">
				<Outlet />
			</RequirePermission>
		),
		children: [
			{ path: "tenancy", element: <TenancyAdminPage /> },
			{ path: "feature-flags", element: <FeatureFlagsPage /> },
		],
	},
];
