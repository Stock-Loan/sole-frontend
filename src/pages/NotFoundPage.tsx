import { ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/PageContainer";
import { routes } from "@/lib/routes";

export function NotFoundPage() {
	return (
		<PageContainer className="flex min-h-[60vh] flex-col items-center justify-center text-center">
			<div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
				<Search className="h-6 w-6" aria-hidden="true" />
			</div>
			<h1 className="mt-4 text-2xl font-semibold">Page not found</h1>
			<p className="mt-2 max-w-md text-sm text-muted-foreground">
				The page you&apos;re looking for doesn&apos;t exist. Check the URL or head back to the
				dashboard.
			</p>
			<div className="mt-6 flex gap-3">
				<Button asChild variant="outline">
					<Link to={routes.root}>
						<ArrowLeft className="mr-2 h-4 w-4" />
						Go home
					</Link>
				</Button>
				<Button asChild>
					<Link to={routes.overview}>View overview</Link>
				</Button>
			</div>
		</PageContainer>
	);
}
