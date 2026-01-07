import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import type { SearchInputProps } from "./types";

export function SearchInput({ className, ...props }: SearchInputProps) {
	return (
		<div className="relative w-full max-w-md">
			<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				className={cn("w-full pl-9 pr-3", className)}
				placeholder="Search..."
				{...props}
			/>
		</div>
	);
}
