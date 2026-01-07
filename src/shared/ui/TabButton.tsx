import { cn } from "@/shared/lib/utils";
import type { TabButtonProps } from "./types";

export function TabButton<T extends string>({
	label,
	value,
	active,
	onSelect,
}: TabButtonProps<T>) {
	return (
		<button
			type="button"
			onClick={() => onSelect(value)}
			className={cn(
				"flex items-center rounded-md px-3 py-2 text-sm font-semibold transition",
				active
					? "bg-primary text-primary-foreground shadow-sm"
					: "text-muted-foreground hover:bg-muted hover:text-foreground"
			)}
		>
			{label}
		</button>
	);
}
