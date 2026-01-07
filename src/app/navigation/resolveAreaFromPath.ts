import { areas, getAreaById, getDefaultArea } from "./areas";
import { navConfig } from "./nav-config";
import type { AppArea } from "./areas";

function normalizePath(pathname: string) {
	const [path] = pathname.split(/[?#]/);
	return path.endsWith("/") && path.length > 1 ? path.slice(0, -1) : path;
}

export function resolveAreaFromPath(pathname: string): AppArea {
	const normalized = normalizePath(pathname);

	const directMatch = areas.find((area) => normalized.startsWith(area.path));
	if (directMatch) {
		return directMatch;
	}

	const navMatch = Object.entries(navConfig).find(([, items]) =>
		items.some((item) => normalized.startsWith(item.path))
	);

	if (navMatch) {
		const areaId = navMatch[0] as keyof typeof navConfig;
		return getAreaById(areaId) ?? getDefaultArea();
	}

	return getDefaultArea();
}
