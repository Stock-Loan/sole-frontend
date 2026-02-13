import { useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { OrgUserListItem } from "@/entities/user/types";
import { useSessionStorage } from "@/shared/hooks/useSessionStorage";
import { StockSearchContext } from "./context";

const TENANCY_STORAGE_KEY = "sole.tenancy";

function loadCurrentOrgId(): string | null {
	if (typeof localStorage === "undefined") return null;
	try {
		const raw = localStorage.getItem(TENANCY_STORAGE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as { currentOrgId?: string | null };
		return parsed.currentOrgId ?? null;
	} catch {
		return null;
	}
}

export function StockSearchProvider({ children }: PropsWithChildren) {
	const storageScope = loadCurrentOrgId() ?? "global";
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
