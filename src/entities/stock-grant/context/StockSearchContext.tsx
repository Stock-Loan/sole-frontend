import { useState, useMemo } from "react";
import type { PropsWithChildren } from "react";
import type { OrgUserListItem } from "@/entities/user/types";
import { StockSearchContext } from "./context";

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
