import { createBrowserRouter, Navigate } from "react-router-dom";
import { authRoutes } from "@/auth/routes";
import { AppErrorBoundary } from "@/app/error-boundary";
import { AppLayout } from "@/app/layouts/AppLayout";
import { BlankLayout } from "@/app/layouts/BlankLayout";
import { WelcomePage } from "@/features/onboarding/pages/WelcomePage";
import { StatusPage } from "@/features/system/pages/StatusPage";
import { NotAuthorizedPage } from "@/features/system/pages/NotAuthorizedPage";
import { NotFoundPage } from "@/features/system/pages/NotFoundPage";
import { routes } from "@/shared/lib/routes";
import { workspaceRoutes } from "@/areas/workspace/routes";
import { workflowsRoutes } from "@/areas/workflows/routes";
import { loansRoutes } from "@/areas/loans/routes";
import { stockRoutes } from "@/areas/stock/routes";
import { peopleRoutes } from "@/areas/people/routes";
import { documentsRoutes } from "@/areas/documents/routes";
import { announcementsRoutes } from "@/areas/announcements/routes";
import { settingsRoutes } from "@/areas/settings/routes";
import { adminRoutes } from "@/areas/admin/routes";

export const router = createBrowserRouter([
	{
		element: <BlankLayout />,
		errorElement: <AppErrorBoundary />,
		children: [
			{ path: routes.root, element: <WelcomePage /> },
			{ path: routes.status, element: <StatusPage /> },
			{ path: routes.notAuthorized, element: <NotAuthorizedPage /> },
		],
	},
	...authRoutes,
	{
		path: routes.appRoot,
		element: <AppLayout />,
		errorElement: <AppErrorBoundary />,
		children: [
			{ index: true, element: <Navigate to="/app/workspace" replace /> },
			{ path: "workspace/*", children: workspaceRoutes },
			{ path: "workflows/*", children: workflowsRoutes },
			{ path: "loans/*", children: loansRoutes },
			{ path: "stock/*", children: stockRoutes },
			{ path: "people/*", children: peopleRoutes },
			{ path: "documents/*", children: documentsRoutes },
			{ path: "announcements/*", children: announcementsRoutes },
			{ path: "settings/*", children: settingsRoutes },
			{ path: "admin/*", children: adminRoutes },

			{ path: "*", element: <NotFoundPage /> },
		],
	},
	{
		path: "*",
		element: <BlankLayout />,
		errorElement: <AppErrorBoundary />,
		children: [{ path: "*", element: <NotFoundPage /> }],
	},
]);
