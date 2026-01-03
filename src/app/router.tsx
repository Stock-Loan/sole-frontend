import { createBrowserRouter } from "react-router-dom";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { Shell } from "@/components/layout/Shell";
import { ChangePasswordPage } from "@/features/auth/pages/ChangePasswordPage";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { StatusPage } from "@/features/public/pages/StatusPage";
import { WelcomePage } from "@/features/public/pages/WelcomePage";
import { routes } from "@/lib/routes";
import { NotAuthorizedPage } from "@/pages/NotAuthorizedPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { OrgUsersListPage } from "@/features/org-users/pages/OrgUsersListPage";
import { OrgUserOnboardingPage } from "@/features/org-users/pages/OrgUserOnboardingPage";
import { OrgUserDetailPage } from "@/features/org-users/pages/OrgUserDetailPage";
import { RolesListPage } from "@/features/roles/pages/RolesListPage";
import { DepartmentsPage } from "@/features/departments/pages/DepartmentsPage";
import { AnnouncementsAdminPage } from "@/features/announcements/pages/AnnouncementsAdminPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { DataTableDemoPage } from "@/pages/data-table-demo/DataTableDemoPage";
import { UserSettingsPage } from "@/features/user-settings/pages/UserSettingsPage";
import { OrgSettingsPage } from "@/features/org-settings/components/OrgSettingsPage";
import { StockAdminPage } from "@/features/stock/pages/StockAdminPage";
import { AppErrorBoundary } from "./error-boundary";
import { PermissionGate } from "@/components/layout/PermissionGate";

export const router = createBrowserRouter([
	{
		path: routes.root,
		element: <WelcomePage />,
		errorElement: <AppErrorBoundary />,
	},
	{
		path: routes.status,
		element: <StatusPage />,
		errorElement: <AppErrorBoundary />,
	},
	{
		path: routes.login,
		element: <LoginPage />,
		errorElement: <AppErrorBoundary />,
	},
	{
		path: routes.changePassword,
		element: <ChangePasswordPage />,
		errorElement: <AppErrorBoundary />,
	},
	{
		path: routes.notAuthorized,
		element: <NotAuthorizedPage />,
		errorElement: <AppErrorBoundary />,
	},
	{
		path: routes.appRoot,
		element: (
			<ProtectedRoute>
				<Shell />
			</ProtectedRoute>
		),
		errorElement: <AppErrorBoundary />,
		children: [
			{
				index: true,
				element: <OverviewPage />,
			},
			{
				path: "overview",
				element: <OverviewPage />,
			},
			{
				path: "data-table-demo",
				element: <DataTableDemoPage />,
			},
			{
				path: "users",
				element: (
					<PermissionGate
						permission="user.view"
						fallback={<NotAuthorizedPage />}
					>
						<OrgUsersListPage />
					</PermissionGate>
				),
			},
			{
				path: "users/:membershipId",
				element: (
					<PermissionGate
						permission="user.view"
						fallback={<NotAuthorizedPage />}
					>
						<OrgUserDetailPage />
					</PermissionGate>
				),
			},
			{
				path: "users/onboard",
				element: (
					<PermissionGate
						permission="user.onboard"
						fallback={<NotAuthorizedPage />}
					>
						<OrgUserOnboardingPage />
					</PermissionGate>
				),
			},
			{
				path: "roles",
				element: (
					<PermissionGate
						permission="role.view"
						fallback={<NotAuthorizedPage />}
					>
						<RolesListPage />
					</PermissionGate>
				),
			},
			{
				path: "departments",
				element: (
					<PermissionGate
						permission="department.view"
						fallback={<NotAuthorizedPage />}
					>
						<DepartmentsPage />
					</PermissionGate>
				),
			},
			{
				path: "announcements",
				element: (
					<PermissionGate
						permission="announcement.view"
						fallback={<NotAuthorizedPage />}
					>
						<AnnouncementsAdminPage />
					</PermissionGate>
				),
			},
			{
				path: "stock",
				element: (
					<PermissionGate
						permission="stock.grant.view"
						fallback={<NotAuthorizedPage />}
					>
						<StockAdminPage />
					</PermissionGate>
				),
			},
			{
				path: "settings",
				element: (
					<PermissionGate
						permission="org.settings.view"
						fallback={<NotAuthorizedPage />}
					>
						<OrgSettingsPage />
					</PermissionGate>
				),
			},
			{
				path: "user-settings",
				element: <UserSettingsPage />,
			},
		],
	},
	{
		path: "*",
		element: <NotFoundPage />,
		errorElement: <AppErrorBoundary />,
	},
]);
