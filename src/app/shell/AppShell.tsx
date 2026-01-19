import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar/Sidebar";
import { Topbar } from "./Topbar/Topbar";

export function AppShell() {
	return (
		<div className="flex h-screen overflow-visible bg-muted/30 p-3">
			<Sidebar />
			<div className="flex min-w-0 flex-1 flex-col">
				<Topbar />
				<main className="min-w-0 flex-1 overflow-y-auto">
					<div className="mx-auto flex h-full w-full min-h-0 flex-col px-4 py-6 sm:px-6 lg:px-10">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
}
