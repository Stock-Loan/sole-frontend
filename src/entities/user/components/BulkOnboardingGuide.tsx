import { Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
	BULK_ONBOARDING_FIELD_GUIDE,
	BULK_ONBOARDING_VALIDATION_NOTES,
} from "../constants";
import type { BulkOnboardingGuideProps } from "../types";

export function BulkOnboardingGuide({ className }: BulkOnboardingGuideProps) {
	return (
		<details
			className={cn(
				"group rounded-lg border border-dashed border-border/70 bg-muted/10 p-3 text-sm text-muted-foreground",
				className
			)}
		>
			<summary className="flex cursor-pointer items-center gap-2 text-foreground">
				<Info className="h-4 w-4 text-muted-foreground group-open:text-primary" />
				<span className="font-semibold">CSV field guide</span>
				<span className="text-xs text-muted-foreground">(click to expand)</span>
			</summary>
			<div className="mt-2 space-y-3 pl-6 text-xs leading-5">
				<ol className="list-decimal space-y-1 pl-4">
					{BULK_ONBOARDING_FIELD_GUIDE.map((item) => (
						<li key={item}>{item}</li>
					))}
				</ol>
				<div className="space-y-1">
					<p className="text-foreground font-semibold">Validation guardrails</p>
					<ul className="list-disc space-y-1 pl-4">
						{BULK_ONBOARDING_VALIDATION_NOTES.map((note) => (
							<li key={note}>{note}</li>
						))}
					</ul>
				</div>
			</div>
		</details>
	);
}
