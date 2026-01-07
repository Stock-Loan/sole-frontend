import type { RouteObject } from "react-router-dom";
import { OrgSettingsPage } from "./pages/OrgSettingsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";

export const settingsRoutes: RouteObject[] = [
	{ index: true, element: <OrgSettingsPage /> },
	{ path: "audit", element: <AuditLogsPage /> },
];
