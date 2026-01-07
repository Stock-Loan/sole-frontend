import { AreaSwitcher } from "./AreaSwitcher";
import { GlobalSearch } from "@/features/search/GlobalSearch";
import { TenantSwitcher } from "@/features/tenancy/TenantSwitcher";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { UserMenu } from "./UserMenu";
import { searchItems } from "./search-items";

export function Topbar() {
	return (
		<header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-border/60 bg-background/95 px-4 py-4 shadow-sm backdrop-blur">
			<div className="flex items-center gap-3">
				<AreaSwitcher />
				<div className="hidden lg:block">
					<GlobalSearch items={searchItems} />
				</div>
			</div>
			<div className="flex items-center gap-3">
				<div className="hidden md:block">
					<TenantSwitcher />
				</div>
				<NotificationBell />
				<UserMenu />
			</div>
		</header>
	);
}
