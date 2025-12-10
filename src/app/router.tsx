import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import App from "./App";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { StatusPage } from "@/features/status/pages/StatusPage";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { WelcomePage } from "@/pages/WelcomePage";
import { RouteErrorBoundary } from "./error-boundary";
import { DashboardPage } from "@/pages/DashboardPage";
import { LoanApplicationsPage } from "@/pages/LoanApplicationsPage";
import { LoansPage } from "@/pages/LoansPage";
import { OrganizationsPage } from "@/pages/OrganizationsPage";
import { PlatformSettingsPage } from "@/pages/PlatformSettingsPage";
import { UserSettingsPage } from "@/pages/UserSettingsPage";

const routes = [
  {
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <WelcomePage />,
      },
      {
        path: "/status",
        element: <StatusPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/app",
        element: (
          <ProtectedRoute>
            <App />
          </ProtectedRoute>
        ),
        children: [
          { index: true, element: <Navigate to="/app/dashboard" replace /> },
          { path: "dashboard", element: <DashboardPage /> },
          { path: "loan-applications", element: <LoanApplicationsPage /> },
          { path: "loans", element: <LoansPage /> },
          { path: "organizations", element: <OrganizationsPage /> },
          { path: "platform-settings", element: <PlatformSettingsPage /> },
          { path: "user-settings", element: <UserSettingsPage /> },
        ],
      },
    ],
  },
];
export const router = createBrowserRouter(routes);
