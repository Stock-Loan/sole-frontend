import { Navigate, type RouteObject } from "react-router-dom";
import { UsersListPage } from "./pages/UsersListPage";
import { UserDetailPage } from "./pages/UserDetailPage";
import { UserOnboardingPage } from "./pages/UserOnboardingPage";
import { RolesPage } from "./pages/RolesPage";
import { DepartmentsPage } from "./pages/DepartmentsPage";

export const peopleRoutes: RouteObject[] = [
	{ index: true, element: <Navigate to="users" replace /> },
	{ path: "users", element: <UsersListPage /> },
	{ path: "users/onboard", element: <UserOnboardingPage /> },
	{ path: "users/:membershipId", element: <UserDetailPage /> },
	{ path: "roles", element: <RolesPage /> },
	{ path: "departments", element: <DepartmentsPage /> },
];
