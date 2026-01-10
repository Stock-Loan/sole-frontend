import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { LoanApplicationsPage } from "./pages/LoanApplicationsPage";
import { LoanDetailPage } from "./pages/LoanDetailPage";
import { RepaymentsPage } from "./pages/RepaymentsPage";
import { AmortizationPage } from "./pages/AmortizationPage";
import { WhatIfPage } from "./pages/WhatIfPage";

export const loansRoutes: RouteObject[] = [
	{
		index: true,
		element: (
			<RequirePermission
				permission={["loan.view_all", "loan.manage"]}
				mode="any"
			>
				<LoanApplicationsPage />
			</RequirePermission>
		),
	},
	{
		path: "applications",
		element: (
			<RequirePermission
				permission={["loan.view_all", "loan.manage"]}
				mode="any"
			>
				<LoanApplicationsPage />
			</RequirePermission>
		),
	},
	{
		path: ":loanId",
		element: (
			<RequirePermission
				permission={["loan.view_all", "loan.manage"]}
				mode="any"
			>
				<LoanDetailPage />
			</RequirePermission>
		),
	},
	{
		path: "repayments",
		element: (
			<RequirePermission permission="loan.payment.view">
				<RepaymentsPage />
			</RequirePermission>
		),
		handle: {
			search: {
				title: "Repayments",
				description: "Review loan repayments and payment history.",
				permissions: "loan.payment.view",
			},
		},
	},
	{
		path: "amortization",
		element: (
			<RequirePermission permission="loan.schedule.view">
				<AmortizationPage />
			</RequirePermission>
		),
	},
	{
		path: "what-if",
		element: (
			<RequirePermission permission="loan.what_if.simulate">
				<WhatIfPage />
			</RequirePermission>
		),
		handle: {
			search: {
				title: "Loan what-if",
				description: "Run loan scenario simulations.",
				permissions: "loan.what_if.simulate",
			},
		},
	},
];
