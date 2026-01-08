import { Navigate, type RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { UsersListPage } from "./pages/UsersListPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UserOnboardingPage } from "./pages/UserOnboardingPage";
import { RolesPage } from "./pages/RolesPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";

export const peopleRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="users" replace /> },
	{
		path: "users",
		children: [
			{
				index: true,
				element: (
					<RequirePermission permission="user.view">
						<UsersListPage />
					</RequirePermission>
				),
			},
			{
				path: "onboard",
				element: (
					<RequirePermission permission="user.onboard">
						<UserOnboardingPage />
					</RequirePermission>
				),
			},
			{
				path: ":membershipId",
				element: (
					<RequirePermission permission="user.view">
						<UserDetailPage />
					</RequirePermission>
				),
			},
		],
	},
	{
		path: "roles",
		element: (
			<RequirePermission permission="role.view">
				<RolesPage />
			</RequirePermission>
		),
	},
	{
		path: "departments",
		element: (
			<RequirePermission permission="department.view">
				<DepartmentsPage />
			</RequirePermission>
		),
	},
];
