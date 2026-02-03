import type { RouteObject } from "react-router-dom";
import { RequireAuth } from "@/app/router/route-guards";
import { AuthLayout } from "./layout/AuthLayout";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { LoginPage } from "./pages/LoginPage";
import { MfaSetupPage } from "./pages/MfaSetupPage";

export const authRoutes: RouteObject[] = [
	{
		path: "/auth",
		element: <AuthLayout />,
		children: [
			{
				path: "login",
				element: <LoginPage />,
			},
			{
				path: "mfa-setup",
				element: (
					<RequireAuth>
						<MfaSetupPage />
					</RequireAuth>
				),
			},
			{
				path: "change-password",
				element: <ChangePasswordPage />,
			},
		],
	},
];
