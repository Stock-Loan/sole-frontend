import { createContext, useContext } from "react";
import type { StockSearchContextValue } from "@/entities/stock-grant/types";

export const StockSearchContext = createContext<StockSearchContextValue | undefined>(undefined);

export function useStockSearch() {
	const ctx = useContext(StockSearchContext);
	if (!ctx) {
		throw new Error("useStockSearch must be used within a StockSearchProvider");
	}
	return ctx;
}
