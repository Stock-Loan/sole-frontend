import { useMemo, useState } from "react";
import { Button } from "@/shared/ui/Button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";
import { useToast } from "@/shared/ui/use-toast";
import { useApiErrorToast } from "@/shared/api/useApiErrorToast";
import {
	useAssignRolesToUser,
	useRemoveRolesFromUser,
	useRolesList,
} from "../hooks";
import type { UserRoleAssignmentsProps } from "../types";

export function UserRoleAssignments({
	membershipId,
	assignedRoleIds,
	onUpdated,
	disableAssignments = false,
	disableReason,
	platformStatus,
}: UserRoleAssignmentsProps) {
	const { toast } = useToast();
	const apiErrorToast = useApiErrorToast();
	const [pendingAssignedIds, setPendingAssignedIds] = useState<Set<string>>(
		() => new Set(assignedRoleIds),
	);

	const { data, isLoading, isError, refetch, isFetching } = useRolesList(
		{ page: 1, page_size: 200 },
		{ staleTime: 5 * 60 * 1000 },
	);

	const assignRolesMutation = useAssignRolesToUser(membershipId, {
		onError: (err: unknown) =>
			apiErrorToast(
				err,
				"Unable to assign roles. Check permissions or try again.",
			),
	});

	const removeRolesMutation = useRemoveRolesFromUser(membershipId, {
		onError: (err: unknown) =>
			apiErrorToast(
				err,
				"Unable to remove roles. Check permissions or try again.",
			),
	});

	const roleList = data?.items ?? []; // Simplified; removed useMemo for React Compiler
	const isPlatformInvited =
		(platformStatus || "").toString().toUpperCase() === "INVITED";

	const handleToggleRole = (roleId: string, checked: boolean) => {
		setPendingAssignedIds((prev) => {
			const next = new Set(prev);
			if (checked) {
				next.add(roleId);
			} else {
				next.delete(roleId);
			}
			return next;
		});
	};

	const handleSave = async () => {
		const currentIds = new Set(assignedRoleIds);
		const newIds = pendingAssignedIds;

		const addedRoleIds = Array.from(newIds).filter((id) => !currentIds.has(id));
		const removedRoleIds = Array.from(currentIds).filter(
			(id) => !newIds.has(id),
		);

		if (addedRoleIds.length === 0 && removedRoleIds.length === 0) return;

		try {
			const promises = [];
			if (addedRoleIds.length > 0) {
				promises.push(assignRolesMutation.mutateAsync(addedRoleIds));
			}
			if (removedRoleIds.length > 0) {
				promises.push(removeRolesMutation.mutateAsync(removedRoleIds));
			}

			await Promise.all(promises);

			toast({
				title: "Roles updated",
				description: "User roles have been successfully updated.",
			});

			onUpdated?.();
		} catch {
			// Errors handled by mutation onError
		}
	};

	const hasChanges = useMemo(() => {
		const currentIds = new Set(assignedRoleIds);
		const newIds = pendingAssignedIds;

		if (currentIds.size !== newIds.size) return true;
		for (const id of newIds) {
			if (!currentIds.has(id)) return true;
		}
		return false;
	}, [assignedRoleIds, pendingAssignedIds]);

	const isSaving =
		assignRolesMutation.isPending || removeRolesMutation.isPending;

	return (
		<div className="space-y-4 rounded-lg border bg-muted/30 p-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold">Roles</h3>
				{isFetching ? (
					<span className="text-xs text-muted-foreground">Updating…</span>
				) : null}
			</div>

			{isLoading ? (
				<p className="text-sm text-muted-foreground">Loading roles…</p>
			) : isError ? (
				<div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
					<span>Unable to load roles.</span>
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				</div>
			) : (
				<div className="space-y-3">
					<div className="grid gap-2">
						{roleList.map((role) => {
							const isAssigned = pendingAssignedIds.has(role.id);
							const name = (role.name || "").toUpperCase();
							const isEmployeeRole =
								name === "EMPLOYEE" ||
								(role.is_system_role && name.includes("EMPLOYEE"));

							// Can only assign EMPLOYEE role if platform status is INVITED
							// But allow UN-assigning any role if it was already there (though backend might block)
							const isDisabled =
								disableAssignments ||
								(isPlatformInvited &&
									!isEmployeeRole &&
									!isAssigned &&
									!pendingAssignedIds.has(role.id));

							return (
								<div
									key={role.id}
									className="flex items-center space-x-2 rounded border border-transparent p-2 hover:bg-muted"
								>
									<Checkbox
										id={`role-${role.id}`}
										checked={isAssigned}
										disabled={isDisabled || isSaving}
										onCheckedChange={(checked) =>
											handleToggleRole(role.id, checked as boolean)
										}
									/>
									<div className="grid gap-1.5 leading-none">
										<Label
											htmlFor={`role-${role.id}`}
											className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
												isDisabled ? "opacity-50" : ""
											}`}
										>
											{role.name}
											{role.is_system_role && (
												<span className="ml-2 text-[10px] uppercase text-muted-foreground">
													System
												</span>
											)}
										</Label>
										{role.description && (
											<p className="text-xs text-muted-foreground">
												{role.description}
											</p>
										)}
									</div>
								</div>
							);
						})}
					</div>

					<div className="flex items-center justify-end gap-2 pt-2">
						<Button
							size="sm"
							onClick={handleSave}
							disabled={!hasChanges || isSaving || disableAssignments}
						>
							{isSaving ? "Saving..." : "Save changes"}
						</Button>
					</div>

					{disableAssignments && disableReason ? (
						<p className="text-xs text-muted-foreground">{disableReason}</p>
					) : null}
					{!disableAssignments && isPlatformInvited ? (
						<p className="text-xs text-muted-foreground">
							Only the EMPLOYEE system role can be assigned while platform
							status is INVITED. Additional roles can be added after activation.
						</p>
					) : null}
				</div>
			)}
		</div>
	);
}
