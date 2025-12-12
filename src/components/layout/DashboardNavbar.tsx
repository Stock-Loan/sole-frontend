import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/common/GlobalSearch";
import { OrgSwitcher } from "@/features/organizations/components/OrgSwitcher";
import { NotificationBell } from "./NotificationBell";
import { UserDropdown } from "./UserDropdown";

interface DashboardNavbarProps {
	onOpenMobileNav: () => void;
	currentLabel?: string;
}

export function DashboardNavbar({ onOpenMobileNav }: DashboardNavbarProps) {
	return (
		<header className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-background/95 px-4 py-5 shadow-sm backdrop-blur">
			<div className="flex items-center gap-3">
				<Button
					variant="outline"
					size="icon"
					className="lg:hidden"
					aria-label="Open menu"
					onClick={onOpenMobileNav}
				>
					<Menu className="h-4 w-4" />
				</Button>
			</div>
			<div className="flex flex-1 items-center justify-end gap-3">
				<div className="hidden flex-1 items-center justify-center gap-3 lg:flex">
					<GlobalSearch />
					<OrgSwitcher />
				</div>
				<div className="flex items-center gap-7">
					<div className="lg:hidden">
						<GlobalSearch compact />
					</div>
					<NotificationBell />
					<UserDropdown showChevron />
				</div>
			</div>
		</header>
	);
}
