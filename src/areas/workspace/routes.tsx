import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { MyLoansPage } from "./pages/MyLoansPage";
import { MyStockPage } from "./pages/MyStockPage";
import { MySettingsPage } from "./pages/MySettingsPage";
import { MyDocumentsPage } from "./pages/MyDocumentsPage";
import { LoanWizardPage } from "./pages/LoanWizardPage";
import { MyLoanDetailPage } from "./pages/MyLoanDetailPage";
import { MyLoanDocumentsPage } from "./pages/MyLoanDocumentsPage";
import { MyVestingEventsPage } from "./pages/MyVestingEventsPage";
import { MyGrantsPage } from "./pages/MyGrantsPage";
import { MyGrantDetailPage } from "./pages/MyGrantDetailPage";

export const workspaceRoutes: RouteObject[] = [
	{
		index: true,
		element: <MyStockPage />,
		handle: {
			search: {
				title: "Overview",
				description: "Review your stock summary and eligibility overview.",
			},
		},
	},
	{
		path: "loans",
		element: (
			<RequirePermission permission={["loan.view_own", "loan.apply"]} mode="any">
				<MyLoansPage />
			</RequirePermission>
		),
	},
	{
		path: "loans/new",
		element: (
			<RequirePermission permission="loan.apply">
				<LoanWizardPage />
			</RequirePermission>
		),
	},
	{
		path: "loans/:id/edit",
		element: (
			<RequirePermission permission="loan.apply">
				<LoanWizardPage />
			</RequirePermission>
		),
	},
	{
		path: "loans/:id",
		element: (
			<RequirePermission permission="loan.view_own">
				<MyLoanDetailPage />
			</RequirePermission>
		),
	},
	{
		path: "documents",
		element: (
			<RequirePermission
				permission={["loan.document.self_view", "loan.document.self_upload_83b"]}
				mode="any"
			>
				<MyDocumentsPage />
			</RequirePermission>
		),
	},
	{
		path: "documents/:id",
		element: (
			<RequirePermission permission="loan.document.self_view">
				<MyLoanDocumentsPage />
			</RequirePermission>
		),
	},
	{
		path: "vesting-events",
		element: <MyVestingEventsPage />,
		handle: {
			search: {
				title: "My vesting events",
				description: "Review upcoming vesting dates and share totals.",
				category: "Stock",
			},
		},
	},
	{
		path: "grants",
		element: <MyGrantsPage />,
		handle: {
			search: {
				title: "My grants",
				description: "Review your grant details and vesting strategy.",
				category: "Stock",
			},
		},
	},
	{
		path: "grants/:grantId",
		element: (
			<RequirePermission permission="stock.self.view">
				<MyGrantDetailPage />
			</RequirePermission>
		),
	},
	{
		path: "settings",
		element: <MySettingsPage />,
		handle: {
			search: {
				title: "My profile",
				description: "Manage your account details and security settings.",
				category: "Account",
			},
		},
	},
];
