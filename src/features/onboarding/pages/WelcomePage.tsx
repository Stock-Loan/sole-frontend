import { ArrowRight, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/ui/Button";
import { PageContainer } from "@/shared/ui/PageContainer";
import { PublicHeader } from "@/shared/ui/PublicHeader";
import { routes } from "@/shared/lib/routes";

export function WelcomePage() {
	return (
		<>
			<PublicHeader />
			<PageContainer className="flex min-h-[75vh] flex-col items-center justify-center text-center pt-10">
				<div className="w-full max-w-4xl space-y-10">
				<div className="space-y-6">
					<div className="inline-flex items-center justify-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
						SOLE platform
					</div>
					<div className="space-y-4">
						<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
							Your stock loan hub, built for clarity.
						</h1>
						<p className="mx-auto max-w-3xl text-lg text-muted-foreground">
							This portal is for members of the organization to access and manage their stock loan
							workflows. If you&apos;re a member, you should have received sign-in credentials from
							the platform team or your manager. If your welcome email hasn&apos;t arrived, please
							contact your manager or the platform team before attempting to sign in.
						</p>
					</div>
					<div className="flex flex-wrap items-center justify-center gap-3">
						<Button asChild size="lg">
							<Link to={routes.login}>
								Sign in
								<ArrowRight className="ml-2 h-4 w-4" />
							</Link>
						</Button>
						<Button asChild variant="outline" size="lg">
							<Link to={routes.status}>View platform status</Link>
						</Button>
					</div>
				</div>
				<div className="grid gap-4 md:grid-cols-3">
					<div className="rounded-xl border bg-card p-5 shadow-sm">
						<div className="flex items-center justify-center gap-2 text-sm font-semibold text-foreground">
							<Shield className="h-4 w-4 text-primary" aria-hidden="true" />
							Secure access
						</div>
						<p className="mt-2 text-sm text-muted-foreground">
							Role-aware authentication with tenant context keeps every organization isolated.
						</p>
					</div>
					<div className="rounded-xl border bg-card p-5 shadow-sm">
						<div className="text-sm font-semibold text-foreground">End-to-end visibility</div>
						<p className="mt-2 text-sm text-muted-foreground">
							Track applications, approvals, and loan status updates in one place.
						</p>
					</div>
					<div className="rounded-xl border bg-card p-5 shadow-sm">
						<div className="text-sm font-semibold text-foreground">Support ready</div>
						<p className="mt-2 text-sm text-muted-foreground">
							Need help? Your manager or platform team can resend your credentials or answer access
							questions.
						</p>
					</div>
				</div>
			</div>
			</PageContainer>
		</>
	);
}
