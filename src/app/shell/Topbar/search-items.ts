import { navConfig } from "@/app/navigation/nav-config";
import { routes } from "@/shared/lib/routes";
import type { SearchItem } from "@/features/search/types";

const navigationItems: SearchItem[] = Object.values(navConfig)
	.flat()
	.map((item) => ({
		title: item.label,
		description: `Go to ${item.label}`,
		category: "Navigation",
		path: item.path,
	}));

export const searchItems: SearchItem[] = [
	...navigationItems,
	{
		title: "Change password",
		description: "Update your credentials securely",
		category: "Account",
		path: routes.changePassword,
	},
	{
		title: "Status",
		description: "Check platform health and dependencies",
		category: "Support",
		path: routes.status,
	},
	{
		title: "Welcome",
		description: "Return to the welcome page",
		category: "Public",
		path: routes.root,
	},
	{
		title: "Login",
		description: "Sign back into the portal",
		category: "Public",
		path: routes.login,
	},
];
