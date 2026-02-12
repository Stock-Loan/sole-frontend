import { useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { OrgUserListItem } from "@/entities/user/types";
import { useSessionStorage } from "@/shared/hooks/useSessionStorage";
import { useTenantOptional } from "@/features/tenancy/hooks";
import { StockSearchContext } from "./context";

export function StockSearchProvider({ children }: PropsWithChildren) {
	const tenant = useTenantOptional();
	const storageScope = tenant?.currentOrgId ?? "global";
	const [searchValue, setSearchValue] = useSessionStorage<string>(
		`sole.stock-search.value.${storageScope}`,
		"",
	);
	const [selectedUser, setSelectedUser] = useSessionStorage<OrgUserListItem | null>(
		`sole.stock-search.user.${storageScope}`,
		null,
	);
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
		[
			searchValue,
			setSearchValue,
			selectedUser,
			setSelectedUser,
			isSearchOpen,
			setIsSearchOpen,
		],
	);

	return (
		<StockSearchContext.Provider value={value}>
			{children}
		</StockSearchContext.Provider>
	);
}
