import { useId, useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useTimezones } from "../hooks/useTimezones";

interface TimezoneSelectProps {
	value?: string;
	onChange: (value: string) => void;
	id?: string;
	name?: string;
	placeholder?: string;
	disabled?: boolean;
	className?: string;
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
	id,
	name,
	placeholder = "Select a timezone",
	disabled,
	className,
}: TimezoneSelectProps) {
	const generatedId = useId().replace(/:/g, "-");
	const listId = `${id ?? generatedId}-list`;
	const { data, isLoading, isError, refetch } = useTimezones();

	const options = useMemo(
		() =>
			(Array.isArray(data) ? data : []).map((tz) => ({
				id: tz,
				label: formatTimezoneLabel(tz),
			})),
		[data],
	);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		onChange(event.target.value);
	};

	const helperText = isError
		? "Unable to load timezones. Retry?"
		: isLoading
			? "Loading timezones…"
			: undefined;

	return (
		<div className="space-y-1">
			<div className="flex items-center gap-2">
				<Input
					id={id}
					name={name}
					list={listId}
					value={value ?? ""}
					onChange={handleChange}
					placeholder={isLoading ? "Loading timezones…" : placeholder}
					disabled={disabled || isLoading}
					className={cn("w-full", className)}
				/>
				{isLoading ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
				{isError ? (
					<button
						type="button"
						className="text-xs font-semibold text-primary hover:underline"
						onClick={() => refetch()}
					>
						Retry
					</button>
				) : null}
			</div>
			{helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
			<datalist id={listId}>
				{options.map((tz) => (
					<option key={tz.id} value={tz.id} label={tz.label} />
				))}
			</datalist>
		</div>
	);
}
