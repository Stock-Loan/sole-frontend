import { RequireAuth, RequireTenant } from "@/app/router/route-guards";
import { AppShell } from "@/app/shell/AppShell";

export function AppLayout() {
	return (
		<RequireAuth>
			<RequireTenant>
				<AppShell />
			</RequireTenant>
		</RequireAuth>
	);
}
