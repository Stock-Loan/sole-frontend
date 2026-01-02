import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { getRouteLabel } from "@/app/dashboard-routes";
import { Logo } from "@/components/common/Logo";
import { DashboardNavbar } from "@/components/layout/DashboardNavbar";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { OrgSwitcher } from "@/features/organizations/components/OrgSwitcher";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Shell() {
	const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
	const location = useLocation();
	const currentLabel = getRouteLabel(location.pathname);

	return (
		<div className="flex h-screen overflow-hidden bg-muted/20">
			<DashboardSidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<DashboardNavbar
					onOpenMobileNav={() => setIsMobileNavOpen(true)}
					currentLabel={currentLabel}
				/>
				<Sheet open={isMobileNavOpen} onOpenChange={setIsMobileNavOpen}>
					<SheetTrigger asChild>
						<span className="hidden" />
					</SheetTrigger>
					<SheetContent side="left" className="w-72 p-0">
						<div className="px-4 py-3">
							<Logo />
						</div>
						<div className="px-4 py-3">
							<OrgSwitcher />
						</div>
						<Separator />
						<div className="px-2 py-3">
							<SidebarNav onNavigate={() => setIsMobileNavOpen(false)} />
						</div>
					</SheetContent>
				</Sheet>
				<main className="min-w-0 flex-1 overflow-y-auto">
					<div className="mx-auto flex h-full w-full min-h-0 flex-col px-4 py-6 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
