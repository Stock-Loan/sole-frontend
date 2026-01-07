import { Outlet } from "react-router-dom";
import { StockSearchProvider } from "./context/StockSearchContext";

export function StockLayout() {
	return (
		<StockSearchProvider>
			<Outlet />
		</StockSearchProvider>
	);
}
