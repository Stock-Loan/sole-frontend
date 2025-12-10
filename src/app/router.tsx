import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";

import App from "./App";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { StatusPage } from "@/features/status/pages/StatusPage";
import { AuthProvider } from "@/features/auth/hooks/useAuth";
import { WelcomePage } from "@/pages/WelcomePage";
import { RouteErrorBoundary } from "./error-boundary";

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
          { index: true, element: <Placeholder label="Dashboard" /> },
          { path: "onboarding/users", element: <Placeholder label="Onboarding" /> },
          { path: "users", element: <Placeholder label="Users" /> },
          { path: "employees", element: <Placeholder label="Employees" /> },
          { path: "settings", element: <Placeholder label="Settings" /> },
          { path: "loan-products", element: <Placeholder label="Loan Products" /> },
          { path: "loan-applications", element: <Placeholder label="Loan Applications" /> },
          { path: "loans", element: <Placeholder label="Loans" /> },
          { path: "reports", element: <Placeholder label="Reports" /> },
          { path: "audit-logs", element: <Placeholder label="Audit Logs" /> },
        ],
      },
    ],
  },
];

function Placeholder({ label }: { label: string }) {
  return <div style={{ padding: "1rem" }}>{label} coming soon</div>;
}

export const router = createBrowserRouter(routes);
