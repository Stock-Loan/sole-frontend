import { Navigate, type RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { OrgSettingsPage } from "./pages/OrgSettingsPage";
import { AuditLogsPage } from "./pages/AuditLogsPage";
import { MidTermRatesPage } from "./pages/MidTermRatesPage";
import { AclAssignmentsPage } from "./pages/AclAssignmentsPage";

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
	{
		path: "acl-assignments",
		element: (
			<RequirePermission permission="acl.manage">
				<AclAssignmentsPage />
			</RequirePermission>
		),
	},
	{
		path: "mid-term-rates",
		element: (
			<RequirePermission permission="org.settings.view">
				<MidTermRatesPage />
			</RequirePermission>
		),
	},
];
