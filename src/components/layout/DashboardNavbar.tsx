import { Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "@/components/common/GlobalSearch";
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
				<div className="hidden flex-col sm:flex">
					<span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
						Now viewing
					</span>
					<div className="flex items-center gap-2 text-base font-semibold text-foreground">
						<span className="h-1.5 w-1.5 rounded-full bg-primary/80" />
						<span>{currentLabel || location.pathname}</span>
					</div>
				</div>
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
