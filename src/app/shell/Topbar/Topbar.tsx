import { AreaSwitcher } from "./AreaSwitcher";
import { GlobalSearch } from "@/features/search/GlobalSearch";
import { TenantSwitcher } from "@/features/tenancy/TenantSwitcher";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { UserMenu } from "./UserMenu";
import { searchItems } from "./search-items";

export function Topbar() {
	return (
		<header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-10 py-4 shadow-sm backdrop-blur">
			<div className="flex items-center gap-3 shrink-0">
				<AreaSwitcher />
			</div>

			<div className="flex flex-1 items-center justify-center gap-4 px-4">
				<div className="hidden lg:block xl:w-full xl:max-w-md">
					<GlobalSearch
						items={searchItems}
						className="xl:w-full"
					/>
				</div>
				<div className="hidden md:block shrink-0">
					<TenantSwitcher className="h-10 px-4" />
				</div>
			</div>

			<div className="flex items-center gap-3 shrink-0">
				<NotificationBell />
				<UserMenu />
			</div>
		</header>
	);
}
