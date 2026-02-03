import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar/Sidebar";
import { Topbar } from "./Topbar/Topbar";

export function AppShell() {
	const [mobileNavOpen, setMobileNavOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		const timeout = window.setTimeout(() => {
			setMobileNavOpen(false);
		}, 0);
		return () => window.clearTimeout(timeout);
	}, [location.pathname]);

	return (
		<div className="relative flex h-[100dvh] overflow-hidden bg-muted/30 md:py-4 md:px-4">
			{mobileNavOpen ? (
				<button
					type="button"
					className="fixed inset-0 z-40 bg-black/30 md:hidden"
					onClick={() => setMobileNavOpen(false)}
					aria-label="Close navigation"
				/>
			) : null}
			<Sidebar
				mobileOpen={mobileNavOpen}
				onMobileClose={() => setMobileNavOpen(false)}
			/>
			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar onToggleSidebar={() => setMobileNavOpen(true)} />
				<main className="min-w-0 flex-1 overflow-y-auto">
					<div className="mx-auto flex h-full w-full min-h-0 flex-col px-4 pt-4 sm:px-6 lg:px-10">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
