import type { RouteObject } from "react-router-dom";
import { LoanApplicationsPage } from "./pages/LoanApplicationsPage";
import { LoanDetailPage } from "./pages/LoanDetailPage";
import { RepaymentsPage } from "./pages/RepaymentsPage";
import { AmortizationPage } from "./pages/AmortizationPage";
import { WhatIfPage } from "./pages/WhatIfPage";

export const loansRoutes: RouteObject[] = [
	{ index: true, element: <LoanApplicationsPage /> },
	{ path: "applications", element: <LoanApplicationsPage /> },
	{ path: ":loanId", element: <LoanDetailPage /> },
	{ path: "repayments", element: <RepaymentsPage /> },
	{ path: "amortization", element: <AmortizationPage /> },
	{ path: "what-if", element: <WhatIfPage /> },
];
