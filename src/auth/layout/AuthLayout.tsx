import { Outlet } from "react-router-dom";

export function AuthLayout() {
	return (
		<div className="h-[100dvh] w-full overflow-y-auto bg-background">
			<Outlet />
		</div>
	);
}
