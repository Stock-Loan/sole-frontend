import type { RouteObject } from "react-router-dom";
import { RequirePermission } from "@/app/router/route-guards";
import { QueuePage } from "./pages/QueuePage";
import { RequestDetailPage } from "./pages/RequestDetailPage";

export const workflowsRoutes: RouteObject[] = [
	{
		index: true,
		element: (
			<RequirePermission
				permission={[
					"loan.queue.hr.view",
					"loan.queue.finance.view",
					"loan.queue.legal.view",
				]}
				mode="any"
			>
				<QueuePage />
			</RequirePermission>
		),
	},
	{
		path: "queue",
		element: (
			<RequirePermission
				permission={[
					"loan.queue.hr.view",
					"loan.queue.finance.view",
					"loan.queue.legal.view",
				]}
				mode="any"
			>
				<QueuePage />
			</RequirePermission>
		),
	},
	{
		path: "requests",
		element: (
			<RequirePermission
				permission={[
					"loan.workflow.hr.manage",
					"loan.workflow.finance.manage",
					"loan.workflow.legal.manage",
				]}
				mode="any"
			>
				<QueuePage />
			</RequirePermission>
		),
	},
	{
		path: "requests/:requestId",
		element: (
			<RequirePermission
				permission={[
					"loan.workflow.hr.manage",
					"loan.workflow.finance.manage",
					"loan.workflow.legal.manage",
				]}
				mode="any"
			>
				<RequestDetailPage />
			</RequirePermission>
		),
	},
];
