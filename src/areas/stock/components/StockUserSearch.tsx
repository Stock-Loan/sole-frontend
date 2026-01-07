import { useMemo, useRef } from "react";
import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { useDebounce } from "@/shared/hooks/useDebounce";
import { getOrgUserDisplayName } from "@/entities/user/constants";
import { useOrgUsersSearch } from "@/entities/user/hooks";
import { useStockSearch } from "../context/StockSearchContext";
import type { OrgUserListItem } from "@/entities/user/types";

const SEARCH_PAGE_SIZE = 25;
const MAX_SEARCH_PAGES = 4;

export function StockUserSearch() {
	const {
		searchValue,
		setSearchValue,
		selectedUser,
		setSelectedUser,
		isSearchOpen,
		setIsSearchOpen,
	} = useStockSearch();
	
	const searchInputRef = useRef<HTMLInputElement>(null);

	const debouncedSearch = useDebounce(searchValue.trim(), 300);
	const shouldSearch = debouncedSearch.length > 0;
	const backendSearchTerm =
		debouncedSearch.length > 3 ? debouncedSearch.slice(0, 3) : debouncedSearch;

	const searchQuery = useOrgUsersSearch(
		backendSearchTerm,
		debouncedSearch,
		{
			enabled: isSearchOpen && shouldSearch,
			pageSize: SEARCH_PAGE_SIZE,
			maxPages: MAX_SEARCH_PAGES,
			staleTime: 30 * 1000,
		}
	);

	const suggestions = useMemo(
		() => searchQuery.data?.items ?? [],
		[searchQuery.data]
	);

	const filteredSuggestions = useMemo(() => {
		if (!shouldSearch) return [];
		const needle = debouncedSearch.toLowerCase();
		return suggestions.filter((user) => {
			const name = getOrgUserDisplayName(user.user).toLowerCase();
			const email = user.user.email?.toLowerCase() ?? "";
			const employeeId = user.membership.employee_id?.toLowerCase() ?? "";
			return (
				name.includes(needle) ||
				email.includes(needle) ||
				employeeId.includes(needle)
			);
		});
	}, [debouncedSearch, shouldSearch, suggestions]);
	
	const showSuggestions = isSearchOpen && shouldSearch;

	const handleSelectUser = (user: OrgUserListItem) => {
		setSelectedUser(user);
		setSearchValue(getOrgUserDisplayName(user.user));
		setIsSearchOpen(false);
		searchInputRef.current?.blur();
	};

	const handleSearchChange = (value: string) => {
		setSearchValue(value);
		setIsSearchOpen(true);
		if (selectedUser) {
			setSelectedUser(null);
		}
	};

	return (
		<div className="relative w-full max-w-sm">
			<Search
				className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
				aria-hidden="true"
			/>
			<Input
				ref={searchInputRef}
				value={searchValue}
				onChange={(event) => handleSearchChange(event.target.value)}
				onFocus={() => setIsSearchOpen(true)}
				onBlur={() => {
					// Delay hiding to allow click event to register
					setTimeout(() => setIsSearchOpen(false), 200);
				}}
				placeholder="Search employee by name or email"
				className="h-12 pl-9"
			/>
			{showSuggestions ? (
				<div className="absolute right-0 top-full z-30 mt-2 w-full rounded-md border border-border/70 bg-card shadow-lg">
					<div className="max-h-72 overflow-y-auto py-1 text-sm">
						{searchQuery.isError ? (
							<div className="px-3 py-2 text-destructive">
								Unable to search users.
							</div>
						) : searchQuery.isFetching ? (
							<div className="px-3 py-2 text-muted-foreground">
								Searching…
							</div>
						) : filteredSuggestions.length === 0 ? (
							<div className="px-3 py-2 text-muted-foreground">
								No users found.
							</div>
						) : (
							filteredSuggestions.map((user) => {
								const name = getOrgUserDisplayName(user.user);
								return (
									<button
										key={user.membership.id}
										type="button"
										onMouseDown={(event) => {
											event.preventDefault();
											handleSelectUser(user);
										}}
										className="w-full px-3 py-2 text-left hover:bg-muted"
									>
										<p className="text-sm font-semibold text-foreground">
											{name}
										</p>
										<p className="text-xs text-muted-foreground">
											{user.user.email}
											{user.membership.employee_id
												? ` • ${user.membership.employee_id}`
												: ""}
										</p>
									</button>
								);
							})
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
