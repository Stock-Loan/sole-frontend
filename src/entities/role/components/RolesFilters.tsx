import { Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/shared/ui/select";
import { FilterBar } from "@/shared/ui/FilterBar";
import type { RoleFilterType, RolesFiltersProps } from "../types";

export function RolesFilters({
	search,
	onSearchChange,
	type,
	onTypeChange,
}: RolesFiltersProps) {
	return (
		<FilterBar className="gap-3 md:flex-nowrap">
			<div className="relative min-w-[220px] flex-1">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by name or description"
					className="pl-9"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
				/>
			</div>
			<div className="flex min-w-[260px] flex-1 flex-wrap gap-3 md:flex-nowrap">
				<Select
					value={type}
					onValueChange={(value) => onTypeChange(value as RoleFilterType)}
				>
					<SelectTrigger className="min-w-[200px]">
						<SelectValue placeholder="Role type" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All roles</SelectItem>
						<SelectItem value="SYSTEM">System</SelectItem>
						<SelectItem value="CUSTOM">Custom</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</FilterBar>
	);
}
