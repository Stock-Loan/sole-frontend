import { Navigate, type RouteObject } from "react-router-dom";
import { TenancyAdminPage } from "./pages/TenancyAdminPage";
import { FeatureFlagsPage } from "./pages/FeatureFlagsPage";

export const adminRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="tenancy" replace /> },
	{ path: "tenancy", element: <TenancyAdminPage /> },
	{ path: "feature-flags", element: <FeatureFlagsPage /> },
];
