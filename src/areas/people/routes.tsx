import { Navigate, type RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { UsersListPage } from "./pages/UsersListPage";
import { UserSummaryPage } from "./pages/UserSummaryPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UserOnboardingPage } from "./pages/UserOnboardingPage";
import { RolesPage } from "./pages/RolesPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";

export const peopleRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="users" replace /> },
	{
		path: "summary",
		element: (
			<RequirePermission permission="user.view">
				<UserSummaryPage />
			</RequirePermission>
		),
		handle: {
			search: {
				title: "User summary",
				description: "Review organization user metrics and engagement.",
				permissions: "user.view",
			},
		},
	},
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
				handle: {
					search: {
						title: "Bulk onboarding",
						description: "Upload a CSV to onboard new users.",
						permissions: "user.onboard",
					},
				},
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
