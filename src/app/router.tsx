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
import { OverviewPage } from "@/pages/OverviewPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { UserSettingsPage } from "@/features/user-settings/pages/UserSettingsPage";
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
				path: "users",
				element: (
					<PermissionGate permission="user.view" fallback={<NotAuthorizedPage />}>
						<OrgUsersListPage />
					</PermissionGate>
				),
			},
			{
				path: "users/:membershipId",
				element: (
					<PermissionGate permission="user.view" fallback={<NotAuthorizedPage />}>
						<OrgUserDetailPage />
					</PermissionGate>
				),
			},
			{
				path: "users/onboard",
				element: (
					<PermissionGate permission="user.onboard" fallback={<NotAuthorizedPage />}>
						<OrgUserOnboardingPage />
					</PermissionGate>
				),
			},
			{
				path: "roles",
				element: (
					<PermissionGate permission="role.view" fallback={<NotAuthorizedPage />}>
						<RolesListPage />
					</PermissionGate>
				),
			},
			{
				path: "departments",
				element: (
					<PermissionGate permission="department.view" fallback={<NotAuthorizedPage />}>
						<DepartmentsPage />
					</PermissionGate>
				),
			},
			{
				path: "announcements",
				element: (
					<PermissionGate permission="announcement.view" fallback={<NotAuthorizedPage />}>
						<PlaceholderPage
							title="Announcements"
							description="Org announcements list, publish/unpublish, and read tracking."
						/>
					</PermissionGate>
				),
			},
			{
				path: "settings",
				element: (
					<PermissionGate permission="org.settings.view" fallback={<NotAuthorizedPage />}>
						<PlaceholderPage
							title="Org settings"
							description="Org-level privacy, security, and retention configuration."
						/>
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
