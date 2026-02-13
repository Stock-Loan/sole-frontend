import { AreaSwitcher } from "./AreaSwitcher";
import { GlobalSearch } from "@/features/search/GlobalSearch";
import { TenantSwitcher } from "@/features/tenancy/TenantSwitcher";
import { NotificationBell } from "@/features/notifications/components/NotificationBell";
import { UserMenu } from "./UserMenu";
import { useMemo } from "react";
import { usePermissions } from "@/auth/hooks";
import { getSearchItems } from "./search-items";
import { Button } from "@/shared/ui/Button";
import { Menu } from "lucide-react";
import type { TopbarProps } from "./types";

export function Topbar({ onToggleSidebar }: TopbarProps) {
	const { can } = usePermissions();
	const searchItems = useMemo(() => getSearchItems(can), [can]);

	return (
		<header className="sticky top-0 z-40 flex items-center justify-between gap-2 px-3 py-3 sm:gap-4 sm:px-6">
			<div className="flex min-w-0 items-center gap-2 shrink-0 sm:gap-3">
				<Button
					type="button"
					variant="ghost"
					size="icon"
					className="lg:hidden"
					onClick={onToggleSidebar}
					aria-label="Open navigation"
				>
					<Menu className="h-5 w-5" />
				</Button>
				<AreaSwitcher />
			</div>

			<div className="hidden md:flex flex-1 items-center justify-center gap-4 px-4">
				<div className="hidden lg:block xl:w-full xl:max-w-md">
					<GlobalSearch items={searchItems} className="xl:w-full" />
				</div>
				<div className="hidden md:block shrink-0">
					<TenantSwitcher className="h-10 px-4" />
				</div>
			</div>

			<div className="flex items-center gap-2 shrink-0 sm:gap-3">
				<NotificationBell />
				<UserMenu />
			</div>
		</header>
	);
}
