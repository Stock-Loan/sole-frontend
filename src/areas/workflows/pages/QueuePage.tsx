import { useMemo, useState } from "react";
import { usePermissions } from "@/auth/hooks";
import { EmptyState } from "@/shared/ui/EmptyState";
import { PageHeader } from "@/shared/ui/PageHeader";
import { PageContainer } from "@/shared/ui/PageContainer";
import { TabButton } from "@/shared/ui/TabButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

const QUEUE_TABS = [
	{
		id: "hr",
		label: "HR",
		permission: "loan.queue.hr.view",
		description: "Review employee eligibility and policy compliance.",
	},
	{
		id: "finance",
		label: "Finance",
		permission: "loan.queue.finance.view",
		description: "Validate repayment terms and funding readiness.",
	},
	{
		id: "legal",
		label: "Legal",
		permission: "loan.queue.legal.view",
		description: "Confirm document requirements and legal checkpoints.",
	},
] as const;

export function QueuePage() {
	const { can } = usePermissions();
	const visibleTabs = useMemo(
		() => QUEUE_TABS.filter((tab) => can(tab.permission)),
		[can]
	);
	const [selectedTab, setSelectedTab] = useState<string>("");

	const activeTab =
		visibleTabs.find((tab) => tab.id === selectedTab)?.id ??
		visibleTabs[0]?.id ??
		"";

	const activeCopy = visibleTabs.find((tab) => tab.id === activeTab);

	return (
		<PageContainer className="space-y-6">
			<PageHeader
				title="Workflow queue"
				subtitle="Review stock loan requests by discipline."
			/>

			{visibleTabs.length === 0 ? (
				<EmptyState
					title="No workflow access"
					message="You don't have queue permissions yet. Contact an administrator if this is unexpected."
				/>
			) : (
				<>
					<div className="flex flex-wrap gap-2">
						{visibleTabs.map((tab) => (
							<TabButton
								key={tab.id}
								label={tab.label}
								value={tab.id}
								active={tab.id === activeTab}
								onSelect={(value) => setSelectedTab(value)}
							/>
						))}
					</div>
					<Card>
						<CardHeader>
							<CardTitle>{activeCopy?.label} queue</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<p className="text-sm text-muted-foreground">
								{activeCopy?.description}
							</p>
							<p className="text-sm text-muted-foreground">
								Requests for this queue will appear here once workflow data is connected.
							</p>
						</CardContent>
					</Card>
				</>
			)}
		</PageContainer>
	);
}
