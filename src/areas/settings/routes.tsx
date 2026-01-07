import { Navigate, type RouteObject } from "react-router-dom";
import { OrgSettingsPage } from "./pages/OrgSettingsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";

export const settingsRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="org" replace /> },
	{ path: "org", element: <OrgSettingsPage /> },
	{ path: "audit", element: <AuditLogsPage /> },
];
