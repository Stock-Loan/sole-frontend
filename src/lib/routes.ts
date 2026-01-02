export const routes = {
	root: "/",
	login: "/login",
	changePassword: "/change-password",
	status: "/status",
	appRoot: "/app",
	overview: "/app/overview",
	users: "/app/users",
	userDetail: "/app/users/:membershipId",
	usersOnboard: "/app/users/onboard",
	roles: "/app/roles",
	departments: "/app/departments",
	announcements: "/app/announcements",
	orgSettings: "/app/settings",
	userSettings: "/app/user-settings",
	dataTableDemo: "/app/data-table-demo",
	notAuthorized: "/not-authorized",
} as const;

export type AppRoute = (typeof routes)[keyof typeof routes];
