import { useMemo } from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTimezones } from "../hooks/useTimezones";

interface TimezoneSelectProps {
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
	contentClassName?: string;
}

function formatTimezoneLabel(tz: string) {
	const parts = tz.split("/");
	const region = parts[0]?.replace(/_/g, " ");
	const city = parts.slice(1).join(" / ").replace(/_/g, " ");
	const friendly = city || region || tz;
	return `${friendly} (${tz})`;
}

export function TimezoneSelect({
	value,
	onChange,
	placeholder = "Select a timezone",
	disabled,
	className,
	contentClassName,
}: TimezoneSelectProps) {
	const { data, isLoading, isError, refetch } = useTimezones();

	const options = useMemo(
		() =>
			(Array.isArray(data) ? data : []).map((tz) => ({
				id: tz,
				label: formatTimezoneLabel(tz),
			})),
		[data],
	);

	const effectivePlaceholder = isLoading ? "Loading timezones…" : placeholder;

	return (
		<div className={cn("space-y-1", className)}>
			<div className="flex items-center gap-2">
				<Select
					value={value ?? ""}
					onValueChange={onChange}
					disabled={disabled || isLoading || options.length === 0}
				>
					<SelectTrigger className="w-full">
						<SelectValue placeholder={effectivePlaceholder} />
					</SelectTrigger>
					<SelectContent
						position="popper"
						className={cn("max-h-64 overflow-auto", contentClassName)}
					>
						{options.length === 0 ? (
							<SelectItem value="none" disabled>
								No timezones
							</SelectItem>
						) : (
							options.map((tz) => (
								<SelectItem key={tz.id} value={tz.id}>
									{tz.label}
								</SelectItem>
							))
						)}
					</SelectContent>
				</Select>
				{isError ? (
					<Button variant="ghost" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				) : null}
			</div>
			{isLoading ? (
				<p className="text-xs text-muted-foreground">Loading timezones…</p>
			) : null}
			{isError ? (
				<p className="text-xs text-destructive">Unable to load timezones.</p>
			) : null}
		</div>
	);
}
