import type { RouteObject } from "react-router-dom";
import { AuthLayout } from "./layout/AuthLayout";
import { ChangePasswordPage } from "./pages/ChangePasswordPage";
import { LoginPage } from "./pages/LoginPage";

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
				path: "change-password",
				element: <ChangePasswordPage />,
			},
		],
	},
];
