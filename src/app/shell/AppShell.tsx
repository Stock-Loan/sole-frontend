import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar/Sidebar";
import { Topbar } from "./Topbar/Topbar";

export function AppShell() {
	return (
		<div className="flex h-screen overflow-hidden bg-muted/20">
			<Sidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar />
				<main className="min-w-0 flex-1 overflow-y-auto">
					<div className="mx-auto flex h-full w-full min-h-0 flex-col px-4 py-6 sm:px-6 lg:px-8">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
