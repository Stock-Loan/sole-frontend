import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogBody,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [localEmployment, setLocalEmployment] = useState<
		EmploymentStatus | "ALL"
	>(employmentStatus);
	const [localPlatform, setLocalPlatform] = useState<PlatformStatus | "ALL">(
		platformStatus
	);
	const [localRoleId, setLocalRoleId] = useState<string>(roleId || "");

	const openDialog = () => {
		setLocalEmployment(employmentStatus);
		setLocalPlatform(platformStatus);
		setLocalRoleId(roleId || "");
		setIsDialogOpen(true);
	};

	const handleApply = () => {
		onEmploymentChange(localEmployment);
		onPlatformChange(localPlatform);
		onRoleChange(localRoleId);
		setIsDialogOpen(false);
	};

	return (
		<>
			<FilterBar className="items-end gap-3 xl:flex-nowrap">
				<div className="relative w-full flex-1 md:w-auto md:min-w-[240px]">
					<p className="mb-1 text-sm font-semibold text-foreground">
						Search or filter organization users
					</p>
					<div className="relative">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<Input
							placeholder="Search by name or email"
							className="pl-9"
							value={search}
							onChange={(event) => onSearchChange(event.target.value)}
						/>
					</div>
				</div>
				<Button
					variant="outline"
					type="button"
					className="shrink-0 self-end"
					onClick={openDialog}
				>
					<Filter className="mr-2 h-4 w-4" aria-hidden="true" />
					Filters
				</Button>
			</FilterBar>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent size="sm">
					<DialogHeader>
						<DialogTitle>Filter users</DialogTitle>
					</DialogHeader>
					<DialogBody>
						<div className="grid gap-4">
							<div className="space-y-2">
								<p className="text-sm font-semibold text-foreground">
									Employment status
								</p>
								<Select
									value={localEmployment}
									onValueChange={(value) =>
										setLocalEmployment(value as EmploymentStatus | "ALL")
									}
								>
									<SelectTrigger className="w-full">
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
							</div>

							<div className="space-y-2">
								<p className="text-sm font-semibold text-foreground">
									Platform status
								</p>
								<Select
									value={localPlatform}
									onValueChange={(value) =>
										setLocalPlatform(value as PlatformStatus | "ALL")
									}
								>
									<SelectTrigger className="w-full">
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
							</div>

							<div className="space-y-2">
								<p className="text-sm font-semibold text-foreground">Role</p>
								<Select
									value={localRoleId || "ALL"}
									onValueChange={(value) =>
										setLocalRoleId(value === "ALL" ? "" : value)
									}
								>
									<SelectTrigger className="w-full">
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
						</div>
					</DialogBody>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button type="button" onClick={handleApply}>
							Apply filters
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
