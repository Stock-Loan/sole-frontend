import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/common/PageHeader";

export function OverviewPage() {
	return (
		<div className="space-y-6">
			<PageHeader
				title="Overview"
				subtitle="Welcome to SOLE. This admin surface will guide org setup, users, and loans."
			/>
			<div className="grid gap-4 md:grid-cols-2">
				<Card>
					<CardContent className="space-y-2 p-6">
						<p className="text-sm font-semibold text-muted-foreground">Next up</p>
						<ul className="space-y-1 text-sm">
							<li>• Configure API base URL and auth once backend is connected.</li>
							<li>• Wire login/tenant context to backend endpoints.</li>
							<li>• Add Org Admin routes for users, roles, departments, announcements.</li>
						</ul>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="space-y-2 p-6">
						<p className="text-sm font-semibold text-muted-foreground">State</p>
						<p className="text-sm text-muted-foreground">
							Query Client, auth, and tenant providers are loaded. Replace placeholder pages with
							real feature screens as backend endpoints land.
						</p>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
