import type { RouteObject } from "react-router-dom";
import { TenancyAdminPage } from "./pages/TenancyAdminPage";
import { FeatureFlagsPage } from "./pages/FeatureFlagsPage";

export const adminRoutes: RouteObject[] = [
	{ index: true, element: <TenancyAdminPage /> },
	{ path: "tenancy", element: <TenancyAdminPage /> },
	{ path: "feature-flags", element: <FeatureFlagsPage /> },
];
