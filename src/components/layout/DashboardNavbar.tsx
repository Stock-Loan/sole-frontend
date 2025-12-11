import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/common/SearchInput";
import { OrgSwitcher } from "@/features/organizations/components/OrgSwitcher";
import { NotificationBell } from "./NotificationBell";
import { UserDropdown } from "./UserDropdown";

interface DashboardNavbarProps {
	onOpenMobileNav: () => void;
	currentLabel?: string;
}

export function DashboardNavbar({
	onOpenMobileNav,
	currentLabel,
}: DashboardNavbarProps) {
	const location = useLocation();

	return (
		<header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/90 px-4 py-3 backdrop-blur">
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
				<div className="hidden sm:flex">
					<span>{currentLabel || location.pathname}</span>
				</div>
			</div>
			<div className="flex flex-1 items-center justify-end gap-3">
				<div className="hidden flex-1 items-center justify-center gap-3 lg:flex">
					<SearchInput />
					<OrgSwitcher />
				</div>
				<NotificationBell />
				<UserDropdown />
			</div>
		</header>
	);
}
