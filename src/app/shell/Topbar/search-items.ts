import type { RouteObject } from "react-router-dom";
import { navConfig } from "@/app/navigation/nav-config";
import { routes } from "@/shared/lib/routes";
import type { SearchItem } from "@/features/search/types";
import { workspaceRoutes } from "@/areas/workspace/routes";
import { workflowsRoutes } from "@/areas/workflows/routes";
import { loansRoutes } from "@/areas/loans/routes";
import { stockRoutes } from "@/areas/stock/routes";
import { peopleRoutes } from "@/areas/people/routes";
import { documentsRoutes } from "@/areas/documents/routes";
import { announcementsRoutes } from "@/areas/announcements/routes";
import { settingsRoutes } from "@/areas/settings/routes";
import { adminRoutes } from "@/areas/admin/routes";

type SearchItemWithAccess = SearchItem & {
	permissions?: string | string[];
};

type RouteSearchMeta = {
	title: string;
	description?: string;
	category?: string;
	permissions?: string | string[];
	path?: string;
	hidden?: boolean;
};

type RouteHandle = {
	search?: RouteSearchMeta;
};

function canSeeItem(
	can: ((permission: string | string[]) => boolean) | null | undefined,
	permissions?: string | string[]
) {
	if (!permissions) return true;
	if (!can) return true;
	const required = Array.isArray(permissions) ? permissions : [permissions];
	return required.some((permission) => can(permission));
}

function joinPaths(basePath: string, segment: string) {
	const trimmedBase = basePath.replace(/\/+$/, "");
	const trimmedSegment = segment.replace(/^\/+/, "");
	if (!trimmedBase) return `/${trimmedSegment}`;
	return `${trimmedBase}/${trimmedSegment}`.replace(/\/+/g, "/");
}

function collectSearchItemsFromRoutes(
	routesList: RouteObject[],
	basePath: string
): SearchItemWithAccess[] {
	const items: SearchItemWithAccess[] = [];

	const walk = (routes: RouteObject[], parentPath: string) => {
		routes.forEach((route) => {
			const handle = route.handle as RouteHandle | undefined;
			const search = handle?.search;
			const isIndex = Boolean(route.index);
			const routePath = route.path ?? "";
			const resolvedPath = search?.path
				? search.path
				: isIndex
					? parentPath
					: routePath
						? joinPaths(parentPath, routePath)
						: parentPath;

			if (
				search &&
				!search.hidden &&
				resolvedPath &&
				!resolvedPath.includes(":") &&
				resolvedPath !== "*"
			) {
				const title = search.title;
				items.push({
					title,
					description: search.description ?? `Go to ${title}`,
					category: search.category ?? "Navigation",
					path: resolvedPath,
					permissions: search.permissions,
				});
			}

			if (route.children && route.children.length > 0) {
				walk(route.children, resolvedPath || parentPath);
			}
		});
	};

	walk(routesList, basePath);
	return items;
}

const routeSearchItems: SearchItemWithAccess[] = [
	...collectSearchItemsFromRoutes(workspaceRoutes, routes.workspace),
	...collectSearchItemsFromRoutes(workflowsRoutes, "/app/workflows"),
	...collectSearchItemsFromRoutes(loansRoutes, "/app/loans"),
	...collectSearchItemsFromRoutes(stockRoutes, "/app/stock"),
	...collectSearchItemsFromRoutes(peopleRoutes, "/app/people"),
	...collectSearchItemsFromRoutes(documentsRoutes, "/app/documents"),
	...collectSearchItemsFromRoutes(announcementsRoutes, "/app/announcements"),
	...collectSearchItemsFromRoutes(settingsRoutes, "/app/settings"),
	...collectSearchItemsFromRoutes(adminRoutes, "/app/admin"),
];

export function getSearchItems(
	can?: (permission: string | string[]) => boolean
): SearchItem[] {
	const navigationItems: SearchItemWithAccess[] = Object.values(navConfig)
		.flat()
		.filter((item) => canSeeItem(can, item.permissions))
		.map((item) => ({
			title: item.label,
			description: `Go to ${item.label}`,
			category: "Navigation",
			path: item.path,
			permissions: item.permissions,
		}));

	const itemsByPath = new Map<string, SearchItemWithAccess>();

	const addItem = (item: SearchItemWithAccess) => {
		if (!itemsByPath.has(item.path)) {
			itemsByPath.set(item.path, item);
		}
	};

	navigationItems.forEach(addItem);
	routeSearchItems.forEach(addItem);

	const staticItems: SearchItemWithAccess[] = [
		{
			title: "Change password",
			description: "Update your credentials securely",
			category: "Account",
			path: routes.changePassword,
		},
		{
			title: "Status",
			description: "Check platform health and dependencies",
			category: "Support",
			path: routes.status,
		},
		{
			title: "Welcome",
			description: "Return to the welcome page",
			category: "Public",
			path: routes.root,
		},
		{
			title: "Login",
			description: "Sign back into the portal",
			category: "Public",
			path: routes.login,
		},
	];

	staticItems.forEach(addItem);

	return Array.from(itemsByPath.values())
		.filter((item) => canSeeItem(can, item.permissions))
		.map((item) => ({
			title: item.title,
			description: item.description,
			category: item.category,
			path: item.path,
		}));
}
