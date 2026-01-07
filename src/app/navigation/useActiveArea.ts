import { useLocation } from "react-router-dom";
import { resolveAreaFromPath } from "./resolveAreaFromPath";

export function useActiveArea() {
	const location = useLocation();
	return resolveAreaFromPath(location.pathname);
}
