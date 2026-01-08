import { Outlet } from "react-router-dom";
import { StockSearchProvider } from "../../entities/stock-grant/context/StockSearchContext";

export function StockLayout() {
	return (
		<StockSearchProvider>
			<Outlet />
		</StockSearchProvider>
	);
}
