import type { RouteObject } from "react-router-dom";
import { AnnouncementsPage } from "./pages/AnnouncementsPage";

export const announcementsRoutes: RouteObject[] = [
	{ index: true, element: <AnnouncementsPage /> },
];
