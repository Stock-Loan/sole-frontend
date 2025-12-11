import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

interface PlaceholderPageProps {
	title: string;
	description?: string;
}

export function PlaceholderPage({
	title,
	description = "This screen is scaffolded and ready to wire to backend endpoints.",
}: PlaceholderPageProps) {
	return (
		<div className="space-y-4">
			<PageHeader title={title} subtitle={description} />
			<Card>
				<CardContent className="flex items-center gap-3 p-6 text-sm text-muted-foreground">
					<Lightbulb className="h-5 w-5 text-primary" aria-hidden="true" />
					<span>
						Add queries, mutations, and UI states here as soon as the feature API is ready. Follow the
						pattern: feature-level API modules, types in `types.ts`, React Query hooks, and shadcn UI.
					</span>
				</CardContent>
			</Card>
		</div>
	);
}
