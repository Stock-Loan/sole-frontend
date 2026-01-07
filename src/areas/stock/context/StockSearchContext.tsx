import { createContext, useContext, useState, useMemo } from "react";
import type { PropsWithChildren } from "react";
import type { OrgUserListItem } from "@/entities/user/types";

interface StockSearchContextValue {
	searchValue: string;
	setSearchValue: (value: string) => void;
	selectedUser: OrgUserListItem | null;
	setSelectedUser: (user: OrgUserListItem | null) => void;
	isSearchOpen: boolean;
	setIsSearchOpen: (open: boolean) => void;
}

const StockSearchContext = createContext<StockSearchContextValue | undefined>(undefined);

export function StockSearchProvider({ children }: PropsWithChildren) {
	const [searchValue, setSearchValue] = useState("");
	const [selectedUser, setSelectedUser] = useState<OrgUserListItem | null>(null);
	const [isSearchOpen, setIsSearchOpen] = useState(false);

	const value = useMemo(
		() => ({
			searchValue,
			setSearchValue,
			selectedUser,
			setSelectedUser,
			isSearchOpen,
			setIsSearchOpen,
		}),
		[searchValue, selectedUser, isSearchOpen]
	);

	return (
		<StockSearchContext.Provider value={value}>
			{children}
		</StockSearchContext.Provider>
	);
}

export function useStockSearch() {
	const ctx = useContext(StockSearchContext);
	if (!ctx) {
		throw new Error("useStockSearch must be used within a StockSearchProvider");
	}
	return ctx;
}
