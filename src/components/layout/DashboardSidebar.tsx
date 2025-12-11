import { Separator } from "@/components/ui/separator";
import { Logo } from "@/components/common/Logo";
import { SidebarNav } from "./SidebarNav";

interface DashboardSidebarProps {
	onNavigate?: () => void;
}

export function DashboardSidebar({ onNavigate }: DashboardSidebarProps) {
	return (
		<aside className="hidden w-64 border-r bg-card/70 px-4 py-6 shadow-sm lg:block">
			<div className="mb-4 space-y-2">
				<Logo />
			</div>
			<Separator className="my-4" />
			<SidebarNav onNavigate={onNavigate} />
		</aside>
	);
}
