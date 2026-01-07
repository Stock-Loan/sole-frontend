import { ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { PageContainer } from "@/shared/ui/PageContainer";
import { routes } from "@/shared/lib/routes";

export function NotAuthorizedPage() {
	return (
		<PageContainer className="flex min-h-[60vh] flex-col items-center justify-center text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
				<ShieldAlert className="h-6 w-6" aria-hidden="true" />
			</div>
			<h1 className="mt-4 text-2xl font-semibold">You do not have access</h1>
			<p className="mt-2 max-w-md text-sm text-muted-foreground">
				Your account is missing permissions for this area. If you think this is a mistake, reach out to
				your administrator.
			</p>
			<div className="mt-6 flex gap-3">
				<Button asChild variant="outline">
					<Link to={routes.root}>Back to start</Link>
				</Button>
				<Button asChild>
					<Link to={routes.status}>Check platform status</Link>
				</Button>
			</div>
		</PageContainer>
	);
}
