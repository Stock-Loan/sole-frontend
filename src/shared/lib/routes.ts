export const routes = {
	root: "/",
	login: "/auth/login",
	changePassword: "/auth/change-password",
	status: "/status",
	appRoot: "/app",
	workspace: "/app/workspace",
	overview: "/app/overview",
	users: "/app/users",
	userDetail: "/app/users/:membershipId",
	usersOnboard: "/app/users/onboard",
	roles: "/app/roles",
	departments: "/app/departments",
	announcements: "/app/announcements",
	stockAdmin: "/app/stock",
	orgSettings: "/app/settings",
	userSettings: "/app/user-settings",
	notAuthorized: "/not-authorized",
	auth: {
		root: "/auth",
		login: () => "/auth/login",
		changePassword: () => "/auth/change-password",
	},
} as const;

type AppRouteKey = Exclude<keyof typeof routes, "auth">;
export type AppRoute = (typeof routes)[AppRouteKey];
