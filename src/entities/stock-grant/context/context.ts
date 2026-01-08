import { createContext, useContext } from "react";
import type { OrgUserListItem } from "@/entities/user/types";

export interface StockSearchContextValue {
	searchValue: string;
	setSearchValue: (value: string) => void;
	selectedUser: OrgUserListItem | null;
	setSelectedUser: (user: OrgUserListItem | null) => void;
	isSearchOpen: boolean;
	setIsSearchOpen: (open: boolean) => void;
}

export const StockSearchContext = createContext<StockSearchContextValue | undefined>(undefined);

export function useStockSearch() {
	const ctx = useContext(StockSearchContext);
	if (!ctx) {
		throw new Error("useStockSearch must be used within a StockSearchProvider");
	}
	return ctx;
}
