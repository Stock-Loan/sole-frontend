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
import { RolesListPage } from "@/features/roles/pages/RolesListPage";
import { OverviewPage } from "@/pages/OverviewPage";
import { PlaceholderPage } from "@/pages/PlaceholderPage";
import { UserSettingsPage } from "@/features/user-settings/pages/UserSettingsPage";
import { AppErrorBoundary } from "./error-boundary";

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
		element: (
			<ProtectedRoute>
				<ChangePasswordPage />
			</ProtectedRoute>
		),
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
				element: <OrgUsersListPage />,
			},
			{
				path: "users/onboard",
				element: <OrgUserOnboardingPage />,
			},
			{
				path: "roles",
				element: <RolesListPage />,
			},
			{
				path: "departments",
				element: (
					<PlaceholderPage
						title="Departments"
						description="Org department structure and primary department assignment."
					/>
				),
			},
			{
				path: "announcements",
				element: (
					<PlaceholderPage
						title="Announcements"
						description="Org announcements list, publish/unpublish, and read tracking."
					/>
				),
			},
			{
				path: "settings",
				element: (
					<PlaceholderPage
						title="Org settings"
						description="Org-level privacy, security, and retention configuration."
					/>
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
