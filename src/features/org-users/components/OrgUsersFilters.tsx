import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type {
	EmploymentStatus,
	OrgUsersFiltersProps,
	PlatformStatus,
} from "../types";

export function OrgUsersFilters({
	search,
	onSearchChange,
	employmentStatus,
	onEmploymentChange,
	platformStatus,
	onPlatformChange,
}: OrgUsersFiltersProps) {
	return (
		<div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr] mb-5">
			<div className="relative">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by name or email"
					className="pl-9"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
				/>
			</div>
			<Select
				value={employmentStatus}
				onValueChange={(value) =>
					onEmploymentChange(value as EmploymentStatus | "ALL")
				}
			>
				<SelectTrigger>
					<SelectValue placeholder="Employment status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="ALL">All employment</SelectItem>
					<SelectItem value="ACTIVE">Active</SelectItem>
					<SelectItem value="INACTIVE">Inactive</SelectItem>
					<SelectItem value="LEAVE">Leave</SelectItem>
					<SelectItem value="TERMINATED">Terminated</SelectItem>
				</SelectContent>
			</Select>
			<Select
				value={platformStatus}
				onValueChange={(value) =>
					onPlatformChange(value as PlatformStatus | "ALL")
				}
			>
				<SelectTrigger>
					<SelectValue placeholder="Platform status" />
				</SelectTrigger>
				<SelectContent>
					<SelectItem value="ALL">All platform</SelectItem>
					<SelectItem value="INVITED">Invited</SelectItem>
					<SelectItem value="ENABLED">Enabled</SelectItem>
					<SelectItem value="DISABLED">Disabled</SelectItem>
					<SelectItem value="LOCKED">Locked</SelectItem>
					<SelectItem value="ACTIVE">Active</SelectItem>
				</SelectContent>
			</Select>
		</div>
	);
}
