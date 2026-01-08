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
				permission={["loan.apply", "loan.view_all", "loan.view_own"]}
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
				permission={["loan.apply", "loan.view_all", "loan.view_own"]}
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
				permission={["loan.view_all", "loan.view_own"]}
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
	},
	{
		path: "amortization",
		element: (
			<RequirePermission
				permission={["loan.schedule.view", "loan.schedule.self.view"]}
				mode="any"
			>
				<AmortizationPage />
			</RequirePermission>
		),
	},
	{
		path: "what-if",
		element: (
			<RequirePermission
				permission={["loan.what_if.simulate", "loan.what_if.self.simulate"]}
				mode="any"
			>
				<WhatIfPage />
			</RequirePermission>
		),
	},
];
