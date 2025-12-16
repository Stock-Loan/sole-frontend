import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { FilterBar } from "@/components/common/FilterBar";
import { queryKeys } from "@/lib/queryKeys";
import { listRoles } from "@/features/roles/api/roles.api";
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
	roleId,
	onRoleChange,
}: OrgUsersFiltersProps) {
	const { data: rolesData } = useQuery({
		queryKey: queryKeys.roles.list(),
		queryFn: listRoles,
		staleTime: 5 * 60 * 1000,
	});

	const roles = rolesData?.items ?? [];

	return (
		<FilterBar className="gap-3 xl:flex-nowrap">
			<div className="relative w-full md:w-auto md:min-w-[220px] flex-1">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					placeholder="Search by name or email"
					className="pl-9"
					value={search}
					onChange={(event) => onSearchChange(event.target.value)}
				/>
			</div>
			<div className="grid grid-cols-2 gap-2 md:flex md:flex-wrap xl:flex-nowrap w-full md:w-auto">
				<Select
					value={employmentStatus}
					onValueChange={(value) =>
						onEmploymentChange(value as EmploymentStatus | "ALL")
					}
				>
					<SelectTrigger className="w-full md:w-[150px]">
						<SelectValue placeholder="Employment" />
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
					<SelectTrigger className="w-full md:w-[150px]">
						<SelectValue placeholder="Platform" />
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
				<Select
					value={roleId || "ALL"}
					onValueChange={(value) => onRoleChange(value === "ALL" ? "" : value)}
				>
					<SelectTrigger className="col-span-2 w-full md:w-[150px] md:col-span-1">
						<SelectValue placeholder="Role" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="ALL">All roles</SelectItem>
						{roles.map((role) => (
							<SelectItem key={role.id} value={role.id}>
								{role.name}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>
		</FilterBar>
	);
}
