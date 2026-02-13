import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { getPasswordPolicyProgress } from "@/shared/lib/password-policy";
import type { PasswordPolicyChecklistProps } from "@/shared/ui/PasswordPolicyChecklist.types";

export function PasswordPolicyChecklist({
	password = "",
	className,
	title = "Password requirements",
}: PasswordPolicyChecklistProps) {
	const { requirements, metCount, totalCount, percent } =
		getPasswordPolicyProgress(password);

	return (
		<div
			className={cn(
				"rounded-xl border border-border/70 bg-gradient-to-br from-background to-muted/30 p-3",
				className,
			)}
		>
			<div className="mb-2 flex items-center justify-between gap-2">
				<p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
					{title}
				</p>
				<span
					className={cn(
						"rounded-full px-2 py-0.5 text-[10px] font-semibold",
						metCount === totalCount
							? "bg-emerald-500/15 text-emerald-700"
							: "bg-muted text-muted-foreground",
					)}
				>
					{metCount}/{totalCount}
				</span>
			</div>
			<div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
				<div
					className={cn(
						"h-full rounded-full transition-all duration-300 ease-out",
						metCount === totalCount ? "bg-emerald-500" : "bg-primary/80",
					)}
					style={{ width: `${percent}%` }}
				/>
			</div>
			<ul className="space-y-1.5">
				{requirements.map((rule) => (
					<li
						key={rule.key}
						className={cn(
							"flex items-center gap-2 text-xs",
							rule.met ? "text-emerald-700" : "text-muted-foreground",
						)}
					>
						{rule.met ? (
							<CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
						) : (
							<Circle className="h-3.5 w-3.5 shrink-0" />
						)}
						<span>{rule.label}</span>
					</li>
				))}
			</ul>
		</div>
	);
}
