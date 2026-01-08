import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";

export const announcementsRoutes: RouteObject[] = [
	{
		index: true,
		element: (
			<RequirePermission permission="announcement.view">
				<AnnouncementsPage />
			</RequirePermission>
		),
	},
];
