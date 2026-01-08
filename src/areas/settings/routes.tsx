import { Navigate, type RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { OrgSettingsPage } from "./pages/OrgSettingsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";

export const settingsRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="org" replace /> },
	{
		path: "org",
		element: (
			<RequirePermission permission="org.settings.view">
				<OrgSettingsPage />
			</RequirePermission>
		),
	},
	{
		path: "audit",
		element: (
			<RequirePermission permission="audit_log.view">
				<AuditLogsPage />
			</RequirePermission>
		),
	},
];
